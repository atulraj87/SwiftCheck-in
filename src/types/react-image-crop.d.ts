declare module "react-image-crop" {
  import type * as React from "react";

  export type Crop = {
    unit?: "%" | "px";
    x?: number;
    y?: number;
    width?: number;
    height?: number;
  };

  export type PixelCrop = {
    unit: "px";
    x: number;
    y: number;
    width: number;
    height: number;
  };

  export function centerCrop(crop: Crop, imageWidth: number, imageHeight: number): Crop;
  export function makeAspectCrop(
    crop: Crop,
    aspect: number,
    imageWidth: number,
    imageHeight: number
  ): Crop;

  export interface ReactCropProps {
    crop: Crop | undefined;
    onChange?(crop: Crop, percentCrop: Crop): void;
    onComplete?(crop: Crop, percentCrop: Crop): void;
    aspect?: number;
    minHeight?: number;
    children?: React.ReactNode;
  }

  const ReactCrop: React.FC<ReactCropProps>;
  export default ReactCrop;
}

