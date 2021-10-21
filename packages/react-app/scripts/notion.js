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


const getPageProperty = (page, key, type = 'text') => {
  const k = page.properties[key]
  if (!k) return type === 'multi_select' ? [] : ''
  if (type === 'text') {
    let text
    if (k.title && k.title.length) {
      text = k.title[0].plain_text
    }
    return text
  } else if (type === 'multi_select') {
    console.log(k.multi_select.map(option => option.name));
    return k.multi_select.map(option => option.name)
  }
}

module.exports = {
  notion,
  getNotionDatabase,
  getPageProperty,
}
