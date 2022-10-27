import { SubCategoryEnum } from 'src/shared/enums';

export interface ExcelArticleRow {
  // Brand: 'JAKO'
  ItemNo: string;
  EAN: string; // may be needed later
  Description: string; // article name
  // Description2: string seems useless
  ColorCode: string; // id of the next column
  ColorDescription: string; // exact color - not for filtering
  Size: string; // size id - DO NOT CONVERT TO INT - exact id of next columns size-name - can be empty todo: what then?
  SizeDescription: string; // always has the same value for the id one column before BUT can be empty
  // VariantCode: '0101' todo what is this?
  HEK: number; // hüttl ek?
  UVP: number; // actual selling price
  // 'recommended UVP': 14.99
  // Text1: 'Strick'         we don't have detail pages so we don't care about these
  // Text2: 'Melange-Effekt' we don't have detail pages so we don't care about these
  // Text3: ''               we don't have detail pages so we don't care about these
  // Text4: ''               we don't have detail pages so we don't care about these
  // Text5: ''               we don't have detail pages so we don't care about these
  // Text6: ''               we don't have detail pages so we don't care about these
  // Text7: ''               we don't have detail pages so we don't care about these
  // Text8: ''               we don't have detail pages so we don't care about these
  // Text9: ''               we don't have detail pages so we don't care about these
  // Text10: ''              we don't have detail pages so we don't care about these
  // Text11: ''              we don't have detail pages so we don't care about these
  // Text12: ''              we don't have detail pages so we don't care about these
  // Material1: '50 % Polyester, 50 % Polyacryl' we don't have detail pages so we don't care about these
  // Material2: ''                               we don't have detail pages so we don't care about these
  // Material3: ''                               we don't have detail pages so we don't care about these
  // Material4: ''                               we don't have detail pages so we don't care about these
  NetWeight: string; // parse with , as decimal point
  Volume: string; // parse with , as decimal point todo liter?
  // Fedas: '200013' todo what is this?
  // ItemCategory: 'ZUBEHÖR' todo needed?
  ProductCategory: string; // category id
  ProductCategoryName: string; // category name
  Image: string; // last part of image url => for example 1230_08.jpg
  // New: ''
  AvailableFrom: number; // (excel converted?) days since 1.1.1900
  AvailableTo: number; // (excel converted?) days since 1.1.1900
  // CustomsTarifNo: '65050090900' todo do we need zollnummer?
  // Button1: '' we don't care - also in dutch
  // Button2: '' we don't care - also in dutch
  // Button3: '' we don't care - also in dutch
  // Button4: '' we don't care - also in dutch
  // Button5: '' we don't care - also in dutch
  DiscontinuedItem: 'Nein' | 'Ja';
  // CountryOfOrigin: 'CN'
  // FedasItemNo: '1223'
  // GroupColor1: 'Rot' todo not now but these are the filter values that would match for color
  // GroupColor2: '' todo not now but these are the filter values that would match for color
  Gender: 'Kids' | 'Men' | 'Women' | 'Unisex'; // todo only two of them are empty right now but they have gender in name
  // VPE: '60' todo verpackungseinheit - maybe later
  // Size_Range: '01-01'
}

export interface ArticleData {
  articleCodeJako: string;
  name: string;
  jakoCategoryId: number;
  colors: {
    [key: string]: {
      colorDescription: string;
      Kids?: ArticleGenderData;
      Men?: ArticleGenderData;
      Women?: ArticleGenderData;
      Unisex?: ArticleGenderData;
    };
  };
  productCategoryName: string;
}

export interface ArticleGenderData {
  gender: Gender;
  cdnImageName: string;
  purchasePrice: number;
  price: number;
  sizes: { [key: string]: ArticleSizeData };
}

export interface ArticleSizeData {
  jakoSizeId: string;
  ean: string;
  availableFrom: string;
  availableTo: string;
  weightInKg: number;
  volumeInLiter: number;
}

type Gender = 'Kids' | 'Men' | 'Women' | 'Unisex';

export type ArticleCategoryKeywordKey = 'top' | 'bottom' | 'tracksuit' | 'shoe';

export type ArticleType =
  | SubCategoryEnum.SHORT_ARMS
  | SubCategoryEnum.LONG_ARMS
  | SubCategoryEnum.SHORTS
  | SubCategoryEnum.PANTS;
