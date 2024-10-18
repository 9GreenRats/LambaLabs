export interface Trait {
  name: string;
  image: File;
  rarity: number;
  dependencies?: { layerIndex: number; traitIndex: number }[];
}

export interface Layer {
  id: string;
  name: string;
  traits: Trait[];
  order: number;
}

export interface GeneratedImage {
  id: string;
  traits: { [key: string]: string };
  imageData: string; // Changed from 'image' to 'imageData' for clarity
}
