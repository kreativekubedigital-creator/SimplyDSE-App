const API_URL = "https://kreativekube.name.ng/wp-json/wp/v2";

export async function getPosts(): Promise<any[]> {
  const response = await fetch(`${API_URL}/posts?_embed`);
  return response.json();
}

export async function getPages(): Promise<any[]> {
  const response = await fetch(`${API_URL}/pages?_embed`);
  return response.json();
}

export async function getPageBySlug(slug: string): Promise<any> {
  const response = await fetch(`${API_URL}/pages?slug=${slug}&_embed`);
  const data = await response.json();
  return data[0]; // REST API returns an array for slug filters
}

export async function getPostBySlug(slug: string): Promise<any> {
  const response = await fetch(`${API_URL}/posts?slug=${slug}&_embed`);
  const data = await response.json();
  return data[0];
}