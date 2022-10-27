export class CreatePrintTemplateDto {
  collectionId: string;
  articleId: string;
  items: ImageInfo[] | null;
  font: string;
}

class ImageInfo {
  imageName: string;
  imageSlot: string;
  font?: string;
}
