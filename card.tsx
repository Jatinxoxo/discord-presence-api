/** @jsxImportSource react */
import { ImageResponse } from '@vercel/og';

export const config = {
  runtime: 'edge',
};

// ✅ Base64 helper for Edge runtime (no Buffer or btoa directly)
function toBase64(arr: ArrayBuffer): string {
  const bytes = new Uint8Array(arr);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return globalThis.btoa(binary);
}

export default async function handler(): Promise<any> {
  try {
    const res = await fetch("https://api.lanyard.rest/v1/users/1102123627438153738");
    const { data }: { data: any } = await res.json();

    const username: string = data?.discord_user?.username || "Unknown";
    const discriminator: string = data?.discord_user?.discriminator || "0000";
    const status: string = data?.discord_status || "offline";
    const activity: string = (data?.activities?.find((a: any) => a.type === 0)?.name) || "";

    const statusColors: Record<string, string> = {
      online: "#22c55e",
      idle: "#eab308",
      dnd: "#ef4444",
      offline: "#6b7280",
    };

    const avatarUrl = data?.discord_user?.avatar
      ? `https://cdn.discordapp.com/avatars/${data.discord_user.id}/${data.discord_user.avatar}.png?size=64`
      : "https://cdn.discordapp.com/embed/avatars/0.png";

    const avatarRes = await fetch(avatarUrl);
    const avatarBuffer = await avatarRes.arrayBuffer();
    const base64 = toBase64(avatarBuffer);
    const staticAvatar = `data:image/png;base64,${base64}`;

    return new ImageResponse(
      (
        <div
          style={{
            width: '480px',
            height: '140px',
            backgroundColor: '#0f172a',
            display: 'flex',
            alignItems: 'center',
            padding: '20px',
            color: 'white',
            fontFamily: 'Segoe UI',
          }}
        >
          <div style={{ position: 'relative', marginRight: '16px' }}>
            <img
              src={staticAvatar}
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '9999px',
                border: '2px solid white',
                objectFit: 'cover',
              }}
            />
            <div
              style={{
                width: '12px',
                height: '12px',
                borderRadius: '9999px',
                backgroundColor: statusColors[status],
                border: '2px solid #0f172a',
                position: 'absolute',
                bottom: 0,
                right: 0,
              }}
            />
          </div>

          <div>
            <h2 style={{ fontSize: '18px', margin: 0 }}>@{username}#{discriminator}</h2>
            <p style={{ margin: 0, fontSize: '14px' }}>Status: {status}</p>
            {activity && <p style={{ margin: 0, fontSize: '14px' }}>Playing: {activity}</p>}
          </div>
        </div>
      ),
      {
        width: 480,
        height: 140,
        headers: {
          'Content-Type': 'image/png',
          'Cache-Control': 's-maxage=60, stale-while-revalidate',
        },
      }
    );
  } catch (err: any) {
    return new Response(`Failed to render card: ${err}`, { status: 500 });
  }
}
