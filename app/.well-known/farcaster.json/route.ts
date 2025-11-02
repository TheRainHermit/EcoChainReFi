function withValidProperties(properties: Record<string, undefined | string | string[]>) {
return Object.fromEntries(
    Object.entries(properties).filter(([_, value]) => (Array.isArray(value) ? value.length > 0 : !!value))
);
}

export async function GET() {
const URL = process.env.NEXT_PUBLIC_URL as string;
return Response.json({
  "accountAssociation": {
    "header": "",
    "payload": "",
    "signature": ""
  },
  "baseBuilder": {
    "ownerAddress": "0x1eEEEE08C989155cA0AA46A3b37d611622e94c1d"
  },
  "miniapp": {
    "version": "1",
    "name": "EcoChain",
    "homeUrl": "https://eco-chain-wallet.vercel.app/",
    "iconUrl": "https://ex.co/i.png",
    "splashImageUrl": "https://ex.co/l.png",
    "splashBackgroundColor": "#000000",
    "webhookUrl": "https://ex.co/api/webhook",
    "subtitle": "Recycle, earn, win",
    "description": "Recycle and earn EcoCoins ($EC0) and NFTs.",
    "screenshotUrls": [
      "https://ex.co/s1.png",
      "https://ex.co/s2.png",
      "https://ex.co/s3.png"
    ],
    "primaryCategory": "social",
    "tags": ["example", "miniapp", "baseapp"],
    "heroImageUrl": "https://ex.co/og.png",
    "tagline": "Earn EcoCoins",
    "ogTitle": "EcoChain",
    "ogDescription": "Recycle and earn EcoCoins ($EC0) and NFTs.",
    "ogImageUrl": "https://ex.co/og.png",
    "noindex": true
  }
});
}