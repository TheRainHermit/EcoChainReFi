function withValidProperties(properties: Record<string, undefined | string | string[]>) {
return Object.fromEntries(
    Object.entries(properties).filter(([_, value]) => (Array.isArray(value) ? value.length > 0 : !!value))
);
}

export async function GET() {
const URL = process.env.NEXT_PUBLIC_URL as string;
return Response.json({
  "accountAssociation": {
    "header": "eyJmaWQiOjEzNzAxODMsInR5cGUiOiJjdXN0b2R5Iiwia2V5IjoiMHhDM0FkMTA0NjIzQ0RhQTI4NTNjZWFFNzlBM2QwQzczOTNERTZhZDEzIn0",
    "payload": "eyJkb21haW4iOiJlY28tY2hhaW4td2FsbGV0LnZlcmNlbC5hcHAifQ",
    "signature": "GQc0dGCj/4dN1szwsI9WzvJHWscrW8633qxqHvbWftF4e6V/WCaZtQFwY1RFAYDH+SNc7h5IVHBJZiUWIBhFNhw="
  },
  "baseBuilder": {
    "ownerAddress": "0xaD1559C2A85fed3e749F1CD0C7dd19945F6d5Ea7"
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