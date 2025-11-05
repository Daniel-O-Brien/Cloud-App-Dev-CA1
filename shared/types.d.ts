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
    "date of birth": string
}

export type Cast = {
    "movie id": number,
    "actor id": number,
    "role name": string,
    "role description": string
}

export type Award = {
    "award id": number,
    "body": string,
    "category": string,
    "year": number
}