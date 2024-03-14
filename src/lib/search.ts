import {
  Db,
  MatchPhraseQuery,
  prepareSQL,
  queryStringPrepare,
} from "@glitterprotocol/glitter-sdk";
import { IBookItem } from "./definitions";

type Row = {
  [key: string]: {
    value: string;
  };
};

type DynamicBookItem = Record<keyof IBookItem, string | number>;

const processDataModal = (resultArr: { row: Row }[]): IBookItem[] => {
  return resultArr.map((item) => {
    const obj: DynamicBookItem = {} as DynamicBookItem;
    Object.keys(item.row).forEach((key) => {
      obj[key as keyof IBookItem] = item.row[key].value;
    });
    return obj as IBookItem;
  });
};

const highlight = (fields: string[]) => {
  const fieldsStr = fields.map((field) => `"${field}"`).join(",");
  return `/*+ SET_VAR(full_text_option='{"highlight":{ "style":"html","fields":[${fieldsStr}]}}') */`;
};

const formatLanguage = (language: string) => {
  return `and (language="${language}" or language="${
    language.charAt(0).toUpperCase() + language.slice(1)
  }")`;
};

const assembleSql = (
  libraryColumns: string,
  libraryTable: string,
  offset: number,
  language?: string | null
) => {
  const highlightStr = highlight(["title", "author"]);

  const languageQuery =
    !language || language === "all" ? "" : formatLanguage(language);

  return {
    results: `select ${highlightStr} ${libraryColumns} from ${libraryTable} where query_string(?) ${languageQuery} limit 200 offset ${offset} `,
    count: `select count(*) from ${libraryTable} where query_string(?) ${languageQuery}`,
  };
};

export const searchBooks = async (
  query: { text: string; offset: number; language: string | null },
  libraryColumns: string,
  libraryTable: string,
  dbClient: Db
): Promise<{ data: IBookItem[]; count: number }> => {
  const queries = [];
  queries.push(new MatchPhraseQuery("title", `${query.text}`));
  const sqlString = queryStringPrepare(queries);

  const sql = assembleSql(
    libraryColumns,
    libraryTable,
    query.offset,
    query.language
  );
  const result = {
    query: prepareSQL(sql.results, sqlString),
    count: prepareSQL(sql.count, sqlString),
  };
  const results = await dbClient.query(result.query);
  const count = await dbClient.query(result.count);
  return {
    data: processDataModal(results?.result || []),
    count: count?.result[0].row["COUNT(*)"].value,
  };
};
