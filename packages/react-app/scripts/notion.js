const { Client } = require('@notionhq/client')
const dotenv = require('dotenv')

dotenv.config()

const notion = new Client({
  auth: process.env.NOTION_AUTH,
})

const getNotionDatabase = async (databaseId) => {
  const page = (await notion.request({
    path: `databases/${databaseId}/query`,
    method: 'post',
    body: {},
  }))
  return page.results
}


const getPageProperty = (page, key) => {
  const k = page.properties[key]
  let text 
  if (k.title && k.title.length) {
    text = k.title[0].plain_text
  }
  return text
}

module.exports = {
  notion,
  getNotionDatabase,
  getPageProperty,
}
