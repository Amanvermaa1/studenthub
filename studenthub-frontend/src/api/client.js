/* =====================================================
   API BASE URL
   ---------------------------------------------------------
   - Production (Vercel): set `VITE_API_URL` in the project's
     Environment Variables, e.g.
       https://studenthub-api.onrender.com/api
   - Local dev: falls back to the local Express server.
   ===================================================== */

const DEV_API = "http://localhost:5000/api";

export const API = (
  import.meta.env.VITE_API_URL || DEV_API
).replace(/\/+$/, "");

export async function request(path, { method = "GET", token, body, headers = {}, ...rest } = {}) {
  const fetchHeaders = {
    ...headers,
  };

  if (body && !(body instanceof FormData)) {
    fetchHeaders["Content-Type"] = "application/json";
  }

  if (token) {
    fetchHeaders.Authorization = `Bearer ${token}`;
  }

  const options = {
    method,
    headers: fetchHeaders,
    ...rest,
  };

  if (body) {
    options.body = body instanceof FormData ? body : JSON.stringify(body);
  }

  const response = await fetch(`${API}${path}`, options);

  const contentType = response.headers.get("content-type");
  const data = contentType?.includes("application/json") ? await response.json() : await response.text();

  return { ok: response.ok, data, status: response.status };
}

// Cloudinary URL helpers
export function cloudinaryImageUrl(url, options = {}) {
  if (!url) return url;
  if (!url.includes("cloudinary.com")) return url;

  const {
    width = 800,
    quality = "auto",
    format = "auto",
    crop = "limit",
  } = options;

  const transform = `w_${width},q_${quality},f_${format},c_${crop}`;

  // Insert transformation after /upload/
  return url.replace("/upload/", `/upload/${transform}/`);
}

export function cloudinaryThumbnailUrl(url, size = 200) {
  return cloudinaryImageUrl(url, { width: size, height: size, crop: "fill", gravity: "auto" });
}