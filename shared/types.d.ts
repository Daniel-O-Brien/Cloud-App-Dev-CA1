export type Movie =   {
    pk: string,
    sk: string,
    title: string,
    release_date: string,
    overview: string
}

export type Actor = {
    pk: string,
    sk: string,
    name: string,
    bio: string,
    date_of_birth: string
}

export type Cast = {
    pk: string,
    sk: string,
    role_name: string,
    role_description: string
}

export type Award = {
    pk: string,
    sk: string,
    category: string,
    year: number
}

export type MovieCastMemberQueryParams = {
  movieId: string;
  actorName?: string;
  roleName?: string
}