const API_URL = "https://kreativekube.name.ng/wp-json/wp/v2";

export async function getPosts(): Promise<any[]> {
  const response = await fetch(`${API_URL}/posts`);
  return response.json();
}

export async function getPages(): Promise<any[]> {
  const response = await fetch(`${API_URL}/pages`);
  return response.json();
}