const { Client } = require("@notionhq/client");
const dotenv = require("dotenv");

dotenv.config();

const notion = new Client({
  auth: process.env.NOTION_AUTH,
});

const getNotionDatabase = async (databaseId, filter) => {
  if (typeof filter === "undefined") {
    const page = await notion.request({
      path: `databases/${databaseId}/query`,
      method: "post",
      body: {},
    });
    return page.results;
  }
  const query = {
    database_id: databaseId,
    filter,
  };
  const resp = await notion.databases.query(query);

  return resp.results;
};

const getPageProperty = (page, key, type = "text") => {
  const k = page.properties[key];
  if (!k) return type === "multi_select" ? [] : "";
  if (type === "text") {
    let text;
    if (k.title && k.title.length) {
      text = k.title[0].plain_text;
    }
    return text;
  }
  if (type === "multi_select") {
    return k.multi_select.map(option => option.name);
  }
  if (type === "date") {
    if (!k.date) return { start: new Date(), end: new Date() };
    return { start: k.date.start, end: k.date.end };
  }
  if (type === "url") {
    return k.url || "#";
  }
};

module.exports = {
  notion,
  getNotionDatabase,
  getPageProperty,
};
