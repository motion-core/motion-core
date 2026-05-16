export type SvgSdf = {
	data: Float32Array;
	width: number;
	height: number;
};

const sdfSize = 2048;
const rasterSupersample = 2;
const inf = 1e20;
const sdfPaddingRatio = 0.05;

export const defaultLogoSvg = `
<svg width="36" height="21" viewBox="0 0 36 21" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M8.77997 0.252267C8.86894 0.0962906 9.03472 0 9.21429 0H14.6334C14.813 0 14.9788 0.0962903 15.0678 0.252267L17.4896 4.49804C17.6814 4.8344 18.1663 4.8344 18.3582 4.49804L20.78 0.252266C20.8689 0.0962897 21.0347 0 21.2143 0H26.6334C26.813 0 26.9788 0.0962903 27.0678 0.252267L29.7826 5.01173C29.8701 5.16527 29.8701 5.35365 29.7826 5.50719L27.3504 9.77119C27.1602 10.1045 27.401 10.5189 27.7847 10.5189H32.6345C32.8135 10.5189 32.9789 10.6146 33.068 10.7698L35.7813 15.4924C35.8696 15.6461 35.8699 15.8351 35.782 15.9892L33.0678 20.7477C32.9788 20.9037 32.813 21 32.6334 21H27.2143C27.0347 21 26.8689 20.9037 26.78 20.7477L24.3582 16.502C24.1663 16.1656 23.6814 16.1656 23.4896 16.502L21.0678 20.7477C20.9788 20.9037 20.813 21 20.6334 21H15.2143C15.0347 21 14.8689 20.9037 14.78 20.7477L12.3582 16.502C12.1663 16.1656 11.6814 16.1656 11.4896 16.502L9.06776 20.7477C8.97879 20.9037 8.81301 21 8.63345 21H3.21429C3.03472 21 2.86894 20.9037 2.77997 20.7477L0.0656847 15.9892C-0.0221722 15.8351 -0.0218778 15.6461 0.0664582 15.4924L2.77971 10.7698C2.86888 10.6146 3.03424 10.5189 3.21325 10.5189H8.06304C8.44678 10.5189 8.68749 10.1045 8.49736 9.77119L6.06517 5.50719C5.97759 5.35365 5.97759 5.16527 6.06517 5.01173L8.77997 0.252267Z" fill="currentColor"/>
</svg>
`.trim();

export async function buildSvgSdf(svgSource: string): Promise<SvgSdf> {
	const image = await loadSvg(svgSource);
	const raster = rasterizeSvgAlpha(image, sdfSize * rasterSupersample);
	const coverage = downsampleCoverage(raster.coverage, raster.size, sdfSize);
	const mask = thresholdCoverage(coverage);
	const inside = distanceTransform(mask, sdfSize, sdfSize, true);
	const outside = distanceTransform(mask, sdfSize, sdfSize, false);
	const data = new Float32Array(sdfSize * sdfSize);

	for (let index = 0; index < data.length; index++) {
		const signedDistance = Math.sqrt(inside[index]) - Math.sqrt(outside[index]);
		const coverageOffset = 0.5 - coverage[index];
		data[index] = (signedDistance + coverageOffset) / sdfSize;
	}

	return {
		data,
		width: sdfSize,
		height: sdfSize,
	};
}

async function loadSvg(svgSource: string): Promise<HTMLImageElement> {
	const url = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgSource)}`;

	return new Promise((resolve, reject) => {
		const image = new Image();
		image.onload = () => resolve(image);
		image.onerror = () => reject(new Error("Failed to load SVG"));
		image.src = url;
	});
}

function rasterizeSvgAlpha(image: HTMLImageElement, size: number) {
	const canvas = document.createElement("canvas");
	canvas.width = size;
	canvas.height = size;

	const context = canvas.getContext("2d", { willReadFrequently: true });
	if (!context) throw new Error("Could not create canvas context");

	const naturalWidth = image.naturalWidth || image.width || 1;
	const naturalHeight = image.naturalHeight || image.height || 1;
	const drawableSize = size * (1 - sdfPaddingRatio * 2);
	const scale = Math.min(
		drawableSize / naturalWidth,
		drawableSize / naturalHeight,
	);
	const drawWidth = naturalWidth * scale;
	const drawHeight = naturalHeight * scale;
	const x = (size - drawWidth) * 0.5;
	const y = (size - drawHeight) * 0.5;

	context.clearRect(0, 0, size, size);
	context.drawImage(image, x, y, drawWidth, drawHeight);

	const pixels = context.getImageData(0, 0, size, size).data;
	const coverage = new Float32Array(size * size);
	for (let pixel = 3, index = 0; pixel < pixels.length; pixel += 4, index++) {
		coverage[index] = pixels[pixel] / 255;
	}

	return { coverage, size };
}

function downsampleCoverage(
	source: Float32Array,
	sourceSize: number,
	targetSize: number,
) {
	if (sourceSize === targetSize) return source;

	const scale = sourceSize / targetSize;
	const output = new Float32Array(targetSize * targetSize);

	for (let y = 0; y < targetSize; y++) {
		for (let x = 0; x < targetSize; x++) {
			let sum = 0;

			for (let sy = 0; sy < scale; sy++) {
				for (let sx = 0; sx < scale; sx++) {
					const sourceX = x * scale + sx;
					const sourceY = y * scale + sy;
					sum += source[sourceY * sourceSize + sourceX];
				}
			}

			output[y * targetSize + x] = sum / (scale * scale);
		}
	}

	return output;
}

function thresholdCoverage(coverage: Float32Array) {
	const mask = new Uint8Array(coverage.length);

	for (let index = 0; index < coverage.length; index++) {
		mask[index] = coverage[index] >= 0.5 ? 1 : 0;
	}

	return mask;
}

function distanceTransform(
	alpha: Uint8Array,
	width: number,
	height: number,
	targetInside: boolean,
) {
	const grid = new Float64Array(width * height);

	for (let index = 0; index < grid.length; index++) {
		const isInside = alpha[index] === 1;
		grid[index] = isInside === targetInside ? 0 : inf;
	}

	const temp = new Float64Array(Math.max(width, height));
	const transformed = new Float64Array(width * height);

	for (let y = 0; y < height; y++) {
		const rowOffset = y * width;
		for (let x = 0; x < width; x++) temp[x] = grid[rowOffset + x];
		const row = edt1d(temp, width);
		for (let x = 0; x < width; x++) transformed[rowOffset + x] = row[x];
	}

	for (let x = 0; x < width; x++) {
		for (let y = 0; y < height; y++) temp[y] = transformed[y * width + x];
		const column = edt1d(temp, height);
		for (let y = 0; y < height; y++) transformed[y * width + x] = column[y];
	}

	return transformed;
}

function edt1d(input: Float64Array, length: number) {
	const output = new Float64Array(length);
	const locations = new Int32Array(length);
	const boundaries = new Float64Array(length + 1);
	let k = 0;

	locations[0] = 0;
	boundaries[0] = -inf;
	boundaries[1] = inf;

	for (let q = 1; q < length; q++) {
		let s = intersection(input, q, locations[k]);

		while (s <= boundaries[k]) {
			k--;
			s = intersection(input, q, locations[k]);
		}

		k++;
		locations[k] = q;
		boundaries[k] = s;
		boundaries[k + 1] = inf;
	}

	k = 0;
	for (let q = 0; q < length; q++) {
		while (boundaries[k + 1] < q) k++;
		const dx = q - locations[k];
		output[q] = dx * dx + input[locations[k]];
	}

	return output;
}

function intersection(input: Float64Array, q: number, vk: number) {
	return (input[q] + q * q - (input[vk] + vk * vk)) / (2 * q - 2 * vk);
}
