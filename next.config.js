/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [
      'dl.airtable.com', 
      'v5.airtableusercontent.com',
      'airtable.com',
      'static.airtable.com',
      'attachments.airtable.com'
    ],
  },
}

module.exports = nextConfig