import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export async function query(query_: string, params: any[]) {
    await pool.query(query_, params);
}

export async function insertArticle(
    id: string,
    source: string,
    title: string,
    sourceUrl: string,
    publishedDate: string,
    authors: string | undefined,
    contentUrl: string,
    therapyId: number
) {
    await query(`
        insert into article (id, source, title, source_url, published_date, authors, content_url, therapy_id)
        values ($1, $2, $3, $4, $5, $6, $7, $8)
        ON CONFLICT (id) DO NOTHING;`,

        [id, source, title, sourceUrl, publishedDate, authors, contentUrl, therapyId]
    )
}