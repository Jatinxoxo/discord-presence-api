/** @jsxImportSource react */
import { ImageResponse } from '@vercel/og';

export const config = {
  runtime: 'edge',
};

// Base64 helper for Edge runtime
function toBase64(arr: ArrayBuffer): string {
  const bytes = new Uint8Array(arr);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return globalThis.btoa(binary);
}

export default async function handler(): Promise<Response> {
  try {
    // Fetch Discord data from Lanyard API
    const res = await fetch("https://api.lanyard.rest/v1/users/1102123627438153738");
    
    if (!res.ok) {
      throw new Error(`Failed to fetch from Lanyard API: ${res.status}`);
    }
    
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

    // Get avatar URL
    const avatarUrl = data?.discord_user?.avatar
      ? `https://cdn.discordapp.com/avatars/${data.discord_user.id}/${data.discord_user.avatar}.png?size=128`
      : "https://cdn.discordapp.com/embed/avatars/0.png";

    // Fetch and convert avatar to base64
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
            backgroundImage: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
            display: 'flex',
            alignItems: 'center',
            padding: '20px',
            color: 'white',
            fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            border: '1px solid #334155',
            borderRadius: '12px',
          }}
        >
          {/* Avatar with status indicator */}
          <div style={{ position: 'relative', marginRight: '20px' }}>
            <img
              src={staticAvatar}
              style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                border: '3px solid #475569',
                objectFit: 'cover',
              }}
            />
            <div
              style={{
                width: '20px',
                height: '20px',
                borderRadius: '50%',
                backgroundColor: statusColors[status],
                border: '3px solid #0f172a',
                position: 'absolute',
                bottom: '2px',
                right: '2px',
              }}
            />
          </div>

          {/* User info */}
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div style={{ 
              fontSize: '24px', 
              fontWeight: 'bold', 
              margin: '0 0 8px 0',
              color: '#f8fafc'
            }}>
              {username}
              <span style={{ 
                fontSize: '18px', 
                color: '#94a3b8',
                fontWeight: 'normal'
              }}>
                #{discriminator}
              </span>
            </div>
            
            <div style={{ 
              fontSize: '16px', 
              margin: '0 0 4px 0',
              color: '#cbd5e1'
            }}>
              Status: <span style={{ 
                color: statusColors[status],
                fontWeight: '600',
                textTransform: 'capitalize'
              }}>{status}</span>
            </div>
            
            {activity && (
              <div style={{ 
                fontSize: '14px', 
                margin: 0,
                color: '#94a3b8'
              }}>
                Playing: <span style={{ 
                  color: '#e2e8f0',
                  fontStyle: 'italic'
                }}>{activity}</span>
              </div>
            )}
          </div>

          {/* Discord logo */}
          <div style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            width: '24px',
            height: '24px',
            backgroundColor: '#5865f2',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '14px',
            fontWeight: 'bold'
          }}>
            D
          </div>
        </div>
      ),
      {
        width: 480,
        height: 140,
        headers: {
          'Content-Type': 'image/png',
          'Cache-Control': 'public, max-age=60, s-maxage=60',
        },
      }
    );
  } catch (err: any) {
    console.error('Error generating card:', err);
    
    // Return error image
    return new ImageResponse(
      (
        <div
          style={{
            width: '480px',
            height: '140px',
            backgroundColor: '#ef4444',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontFamily: 'Inter, sans-serif',
            fontSize: '18px',
            fontWeight: 'bold',
            borderRadius: '12px',
          }}
        >
          Failed to load Discord status
        </div>
      ),
      {
        width: 480,
        height: 140,
        headers: {
          'Content-Type': 'image/png',
          'Cache-Control': 'no-cache',
        },
      }
    );
  }
}