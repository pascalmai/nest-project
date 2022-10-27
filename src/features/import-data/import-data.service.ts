import path from 'path';
import xlsx from 'xlsx';

import { Injectable } from '@nestjs/common';
import { Connection } from 'typeorm';
import fromPairs from 'lodash/fromPairs';
import {
  ACGenderEnum,
  CATEGORY_IDENT,
  LongArmsSlotEnum,
  PantsSlotEnum,
  ShortArmsSlotEnum,
  ShortsSlotEnum,
  SubCategoryEnum,
} from '../../shared/enums';
import {
  ArticleData,
  ArticleGenderData,
  ArticleSizeData,
  ExcelArticleRow,
} from './types';
import { formatExcelDate } from './helpers/formatExcelDate';
import { mapProductCategoryNameToIdent } from './constants/mapProductCategoryNameToIdent';
import { buildMultirowInsert } from './helpers/buildMultirowInsert';
import { arrayChunk } from './helpers/arrayChunk';
import { mapProductCategoryNameToArticleType } from './constants/mapProductCategoryNameToArticleType';

@Injectable()
export class ImportDataService {
  static readonly eanSheetName = 'EAN.xls';

  constructor(private readonly connection: Connection) {}

  static readEANxlsSheet(fileName: string): Promise<ExcelArticleRow[]> {
    return new Promise((resolve) => {
      const workbook = xlsx.readFile(
        `${path.resolve(__dirname, `../../assets/files/${fileName}`)}`,
      );

      resolve(
        xlsx.utils.sheet_to_json(
          workbook.Sheets[ImportDataService.eanSheetName],
        ),
      );
    });
  }

  async runSaveArticleCatalog(fileName: string): Promise<any> {

    const excelRows = await ImportDataService.readEANxlsSheet(fileName);

    const sizes = getUniqueSizes(excelRows);
    const jakoCategories = getUniqueCategories(excelRows);

    const categories = await this.connection.query(
      'SELECT id, ident FROM ac_category',
    );

    const categoryNameToId = fromPairs(categories.map((v) => [v.ident, v.id]));

    const articles: { [key: string]: ArticleData } = {};

    for (const row of excelRows) {
      if (!row.UVP) row.UVP = 0;
      // region fixes
      if (row.ItemNo === '5730') {
        const sizeInt = parseInt(row.Size);

        if (sizeInt < 36) {
          row.Gender = 'Kids';
        }
      }

      if (row.ItemNo === '9250D' && !row.Gender) {
        row.Gender = 'Unisex';
      }
      // endregion fixes

      // region article base data
      const currentArticleData: Omit<ArticleData, 'colors'> = {
        articleCodeJako: row.ItemNo,
        name: row.Description,
        jakoCategoryId: parseInt(row.ProductCategory),
        productCategoryName: row.ProductCategoryName,
      };

      if (!(currentArticleData.articleCodeJako in articles)) {
        articles[currentArticleData.articleCodeJako] = {
          ...currentArticleData,
          colors: {},
        };
      } else {
        for (const [prop, value] of Object.entries(currentArticleData)) {
          if (
            value !==
            articles[currentArticleData.articleCodeJako][
              prop as keyof ArticleData
            ]
          ) {
            console.log(
              `article ${currentArticleData.articleCodeJako} has different base data for prop ${prop}`,
            );
          }
        }
      }
      // endregion article base data

      const articleEntry = articles[currentArticleData.articleCodeJako];

      // region article color data
      if (!(row.ColorCode in articleEntry.colors)) {
        articleEntry.colors[row.ColorCode] = {
          colorDescription: row.ColorDescription,
        };
      }
      // endregion article color data

      const colorEntry = articleEntry.colors[row.ColorCode];

      // a price group is further divided into genders (see link below)
      // https://www.jako.de/de/search/?input_search=jogginghose+premium
      // region article gender data
      const genderList = Object.values(ACGenderEnum) as Array<string>;
      if (!genderList.includes(row.Gender)) {
        row.Gender = 'Unisex';
      }

      const currentGenderData: Omit<ArticleGenderData, 'sizes'> = {
        gender: row.Gender,
        cdnImageName: row.Image,
        price: row.UVP,
        purchasePrice: row.HEK,
      };

      if (!(currentGenderData.gender in colorEntry)) {
        colorEntry[currentGenderData.gender] = {
          ...currentGenderData,
          sizes: {},
        };
      } else {
        for (const [prop, value] of Object.entries(currentGenderData)) {
          if (
            value !==
            colorEntry[currentGenderData.gender][
              prop as keyof ArticleGenderData
            ]
          ) {
            console.log(
              `article ${currentArticleData.articleCodeJako} with color ${row.ColorCode} and gender ${currentGenderData.gender} has different data for prop ${prop}`,
            );
          }
        }
      }
      // endregion article gender data

      const genderEntry = colorEntry[currentGenderData.gender];

      // region article size data
      const currentSizeData: ArticleSizeData = {
        jakoSizeId: row.Size,
        ean: row.EAN,
        availableFrom: formatExcelDate(row.AvailableFrom),
        availableTo: formatExcelDate(row.AvailableTo),
        weightInKg:
          row.NetWeight === undefined
            ? 0
            : parseFloat(row.NetWeight.replace('.', '').replace(',', '.')),
        volumeInLiter:
          row.Volume === undefined
            ? 0
            : parseFloat(row.Volume.replace('.', '').replace(',', '.')),
      };

      if (!(currentSizeData.jakoSizeId in genderEntry.sizes)) {
        genderEntry.sizes[currentSizeData.jakoSizeId] = currentSizeData;
      } else {
        for (const [prop, value] of Object.entries(currentSizeData)) {
          if (
            value !==
            genderEntry.sizes[currentSizeData.jakoSizeId][
              prop as keyof ArticleSizeData
            ]
          ) {
            console.log(
              `article ${currentArticleData.articleCodeJako} with color ${row.ColorCode}, gender ${currentGenderData.gender} and size ${currentSizeData.jakoSizeId} has different data for prop ${prop}`,
            );
          }
        }
      }
      // endregion article size data
    }

    const sizesRows = Object.entries(sizes).map(([jako_size_id, name]) => ({
      jako_size_id,
      name,
    }));

    const [sizesJakoInsertSql, sizesJakoInsertValues] = buildMultirowInsert(
      'ac_jako_size',
      // eslint-disable-next-line camelcase
      sizesRows,
    );

    // todo at some point we should probably throw
    await this.connection.query(
      `
          ${sizesJakoInsertSql}
          ON CONFLICT
            DO NOTHING
        `,
      sizesJakoInsertValues,
    );

    const categoriesRows = Object.entries(jakoCategories).map(
      ([jako_category_id, name]) => ({
        jako_category_id,
        name,
        category_id: categoryNameToId[mapProductCategoryNameToIdent[name]],
      }),
    );

    const [categoriesJakoSql, categoriesJakoInsertValues] = buildMultirowInsert(
      'ac_jako_category',
      // eslint-disable-next-line camelcase
      categoriesRows,
    );

    // only DO NOTHING when the id already exists. when the category was renamed we want an error
    await this.connection.query(
      `
          ${categoriesJakoSql}
          ON CONFLICT (jako_category_id)
            DO NOTHING
        `,
      categoriesJakoInsertValues,
    );

    const articlesToInsert = [];
    const articleGendersToInsert = [];
    const articleSizesToInsert = [];
    for (const jakoArticleId in articles) {
      const articleData = articles[jakoArticleId];

      for (const colorId in articleData.colors) {
        articlesToInsert.push({
          jako_id: articleData.articleCodeJako,
          name: articleData.name,
          jako_color_code: colorId,
          jako_color_description:
            articleData.colors[colorId]['colorDescription'],
          jako_category_id: articleData.jakoCategoryId,
          article_type:
            mapProductCategoryNameToArticleType[
              articleData.productCategoryName
            ],
        });

        for (const gender in articleData.colors[colorId]) {
          if (gender !== 'colorDescription') {
            const genderData = articleData.colors[colorId][gender];

            articleGendersToInsert.push({
              _article_id: articleData.articleCodeJako,
              _jako_color_code: colorId,
              gender,
              cdn_image_name: genderData.cdnImageName,
              purchase_price: genderData.purchasePrice || 1,
              price: genderData.price,
            });

            for (const sizeId in genderData.sizes) {
              const sizeData = genderData.sizes[sizeId];

              articleSizesToInsert.push({
                _jako_article_id: articleData.articleCodeJako,
                _jako_color_code: colorId,
                _gender: gender,
                jako_size_id: sizeData.jakoSizeId, // todo FK
                ean: sizeData.ean, // todo unique
                available_from: sizeData.availableFrom,
                available_to: sizeData.availableTo,
                weight_in_kg: sizeData.weightInKg,
                volume_in_liter: sizeData.volumeInLiter,
              });
            }
          }
        }
      }
    }

    const [articlesInsertSql, articlesInsertValues] = buildMultirowInsert(
      'ac_article',
      articlesToInsert,
    );

    console.log('inserting articles');

    const articleInsertResponse = await this.connection.query(
      `
          ${articlesInsertSql}
          ON CONFLICT (jako_id, jako_color_code)
            DO UPDATE SET
              name = EXCLUDED.name,
              jako_category_id = EXCLUDED.jako_category_id
          RETURNING id, jako_id, jako_color_code
        `,
      articlesInsertValues,
    );

    const articleConfigToArticleId = Object.fromEntries(
      articleInsertResponse.map((row) => [
        row.jako_id + '-' + row.jako_color_code,
        row.id,
      ]),
    );

    console.log('Invalidating articles that are no longer present in excel sheet');

    // updating the article size available_to for articles no more present in excel sheet to one day from current date so that it becomes unavailable'
    await this.connection.query(
      `
        UPDATE ac_article_size size
        SET available_to = NOW()::DATE - 1
        FROM ac_article_gender gender 
        WHERE gender.id = size.gender_id AND NOT (gender.article_id = ANY($1))
      `,
      [articleInsertResponse.map((row) => row.id)],
    );

    console.log('truncating ac_article_size and ac_article_gender');

    const [articleGendersInsertSql, articleGendersInsertValues] =
      buildMultirowInsert(
        'ac_article_gender',
        articleGendersToInsert.map((genderEntry) => ({
          article_id:
            articleConfigToArticleId[
              genderEntry._article_id + '-' + genderEntry._jako_color_code
            ],
          gender: genderEntry.gender,
          cdn_image_name: genderEntry.cdn_image_name,
          purchase_price: genderEntry.purchase_price,
          price: genderEntry.price,
        })),
      );

    console.log('inserting article_genders');

    const articleGenderInsertResponse = await this.connection.query(
      `
          ${articleGendersInsertSql}
        `,
      articleGendersInsertValues,
    );

    const articleGenderConfigToGenderId = Object.fromEntries(
      articleGenderInsertResponse.map((row) => [
        row.article_id + '-' + row.gender,
        row.id,
      ]),
    );

    console.log('inserting article_sizes');

    const articleSizesInsertParams = articleSizesToInsert.map((sizeEntry) => {
      const articleId =
        articleConfigToArticleId[
          sizeEntry._jako_article_id + '-' + sizeEntry._jako_color_code
        ];

      return {
        gender_id:
          articleGenderConfigToGenderId[articleId + '-' + sizeEntry._gender],
        jako_size_id: sizeEntry.jako_size_id,
        ean: sizeEntry.ean,
        available_from:
          sizeEntry.available_from === 'NaNNaNNaN'
            ? sizeEntry.available_to
            : sizeEntry.available_from, // Put available_from equal available_to if available_from not available
        available_to: sizeEntry.available_to,
        weight_in_kg: sizeEntry.weight_in_kg,
        volume_in_liter: sizeEntry.volume_in_liter,
      };
    });

    // these easily become > 90k and postgres' limit is 65535 - so let's chunk it
    for (const chunk of arrayChunk(
      articleSizesInsertParams,
      Math.floor(65535 / 7),
    )) {
      const [articleSizesInsertSql, articleSizesInsertValues] =
        buildMultirowInsert('ac_article_size', chunk);

      await this.connection.query(
        `${articleSizesInsertSql}
          ON CONFLICT (ean)
          DO NOTHING
        `,
        articleSizesInsertValues,
      );
    }

    await addTemplateSlots(this.connection);

    return articles;
  }
}

function getUniqueSizes(excelRows: ExcelArticleRow[]) {
  const sizes: { [key: string]: { [key: string]: string[] } } = {};

  for (const row of excelRows) {
    const size = row.Size === undefined ? 'EMPTY' : row.Size;

    if (!(size in sizes)) {
      sizes[size] = {};
    }

    const sizeDesc =
      row.SizeDescription === undefined ? 'EMPTY' : row.SizeDescription;

    if (!(sizeDesc in sizes[size])) {
      sizes[size][sizeDesc] = [];
    }

    sizes[size][sizeDesc].push(row.Description);
  }

  return Object.fromEntries(
    Object.entries(sizes).map(([size, descriptionMap]) => [
      size,
      Object.keys(descriptionMap)[0],
    ]),
  );
}

function getUniqueCategories(excelRows: ExcelArticleRow[]) {
  const categories: { [key: string]: { [key: string]: string[] } } = {};

  for (const row of excelRows) {
    if (!row.ProductCategory) {
      row.ProductCategory = '1';
    }
    if (!(row.ProductCategory in categories)) {
      categories[row.ProductCategory] = {};
    }

    if (!(row.ProductCategoryName in categories[row.ProductCategory])) {
      categories[row.ProductCategory][row.ProductCategoryName] = [];
    }

    categories[row.ProductCategory][row.ProductCategoryName].push(
      row.Description,
    );
  }

  return Object.fromEntries(
    Object.entries(categories).map(([category, descriptionMap]) => [
      category,
      Object.keys(descriptionMap)[0],
    ]),
  );
}

async function addTemplateSlots(connection) {
  const articleIds = await connection.query(`
    SELECT
      aa.id,
      aa.article_type,
      ac.ident
    FROM
      ac_article aa
    LEFT JOIN ac_jako_category ajc ON
      aa.jako_category_id = ajc.jako_category_id
    LEFT JOIN ac_category ac ON
      ajc.category_id = ac.id
    WHERE aa.is_printable = TRUE
  `);

  if (!articleIds || !articleIds.length) {
    return;
  }

  let insertSQL = `INSERT INTO ac_article_template_slot (article_id, "name") VALUES `;

  for (let i = 0; i < articleIds.length; i++) {
    const {
      id,
      ident: categoryIdent,
      article_type: articleType,
    } = articleIds[i] || {};

    if (!id || (!articleType && categoryIdent !== CATEGORY_IDENT.TRACK_SUIT)) {
      continue;
    }

    insertSQL += `${getInsertValuesForArticle(
      id,
      articleType,
      categoryIdent,
    )}, `;
  }

  // Remove last comma and replace with semi colon
  insertSQL = insertSQL.replace(/..$/, ';');
  await connection.query(insertSQL);
}

function getInsertValuesForArticle(
  articleId: string,
  articleType?: string,
  categoryIdent?: string,
): string {
  let slotNames = [];

  if (articleType === SubCategoryEnum.LONG_ARMS) {
    slotNames = [...Object.values(LongArmsSlotEnum)];
  } else if (articleType === SubCategoryEnum.SHORT_ARMS) {
    slotNames = [...Object.values(ShortArmsSlotEnum)];
  } else if (articleType === SubCategoryEnum.PANTS) {
    slotNames = [...Object.values(PantsSlotEnum)];
  } else if (articleType === SubCategoryEnum.SHORTS) {
    slotNames = [...Object.values(ShortsSlotEnum)];
  } else if (categoryIdent === CATEGORY_IDENT.TRACK_SUIT) {
    slotNames = [
      ...Object.values(LongArmsSlotEnum),
      ...Object.values(PantsSlotEnum),
    ];
  }
  return slotNames.map((name) => `('${articleId}', '${name}')`).join(', ');
}
