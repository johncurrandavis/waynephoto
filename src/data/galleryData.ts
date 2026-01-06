/**
 * galleryData.ts
 *
 * This module defines the structure of the gallery content and
 * provides a helper to load it from a YAML file.
 *
 * Responsibilities:
 * - Define the schema for collections and images
 * - Load and parse gallery.yaml
 */

import path from 'path';
import { promises as fs } from 'fs';
import * as yaml from 'js-yaml';

/**
 * Structure of the collections YAML file
 * @property {Collection[]} collections - Array of collections
 */
export interface GalleryData {
	collections: Collection[];
	images: GalleryImage[];
}

/**
 * Represents a collection of images
 * @property {string} name - Name of the collection
 * @property {GalleryImage[]} getImages - Array of images in the collection
 */
export interface Collection {
	id: string;
	name: string;
}

/**
 * Represents a single image entry as defined in gallery.yaml.
 *
 * This is *content data only*:
 * - The image path is a string
 * - Metadata comes from YAML
 *
 * @property {string} path - Relative path to the image file
 * @property {string} alt - Alt text for accessibility and title
 * @property {string} description - Detailed description of the image
 * @property {string[]} collections - Array of collection IDs the image belongs to
 */
export interface GalleryImage {
	path: string;
	meta: Meta;
	exif?: ImageExif;
}

/**
 * Represents the metadata of an image
 * @property {string} path - Relative path to the image file
 * @property {string} title - Title of the image
 * @property {string} description - Detailed description of the image
 * @property {string[]} collections - Array of collection IDs the image belongs to
 */
export interface Meta {
	title: string;
	description: string;
	collections: string[];
}

/**
 * Optional EXIF metadata for an image.
 *
 * NOTE:
 * - EXIF data is not currently extracted automatically.
 * - These fields exist to support future enhancements
 *   (e.g. sorting or displaying camera settings).
 *
 * @property {number} [focalLength] - Focal length of the lens
 * @property {number} [iso] - ISO sensitivity
 * @property {number} [fNumber] - Aperture value
 * @property {number} [shutterSpeed] - Shutter speed
 * @property {Date} [captureDate] - Date and time of capture
 * @property {string} [model] - Camera model
 * @property {string} [lensModel] - Lens model
 */
export interface ImageExif {
	focalLength?: number;
	iso?: number;
	fNumber?: number;
	shutterSpeed?: number;
	captureDate?: Date;
	model?: string;
	lensModel?: string;
}

/**
 * Loads and parses a gallery YAML file from disk.
 *
 * (does not validate image paths or collections —
 * only returns the raw structured data)
 */
export const loadGallery = async (galleryPath: string): Promise<GalleryData> => {
	const yamlPath = path.resolve(process.cwd(), galleryPath);
	const content = await fs.readFile(yamlPath, 'utf8');
	return yaml.load(content) as GalleryData;
};
