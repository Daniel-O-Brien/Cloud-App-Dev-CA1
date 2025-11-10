export type Movie =   {
  id: number,
  title: string,
  release_date: string,
  overview: string
}

export type Actor = {
    id: number,
    name: string,
    bio: string,
    date_of_birth: string
}

export type Cast = {
    movie_id: number,
    actor_id: number,
    role_name: string,
    role_description: string
}

export type Award = {
    id: number,
    body: string,
    category: string,
    year: number
}