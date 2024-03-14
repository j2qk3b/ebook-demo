export interface IBookItem {
  ipfs_cid: string;
  title: string;
  author: string;
  publisher: string;
  year: string;
  language: string;
  extension: string;
  size: string;
  filesize: string;
  _id: string;
  downloadPercent?: number;
  _highlight_title: string;
  _highlight_author: string;
}
