import { api } from '../services/api'
import { GetStaticProps } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import Head from 'next/head'
import { format, parseISO } from 'date-fns'
import ptBR from 'date-fns/locale/pt-BR'
import { convertDurationToTimeString } from '../utils/convertDurationToTimeString'

import styles from './home.module.scss'
import { usePlayer } from '../contexts/PlayerContext'

type Episode = {
  id: string;
  title: string;
  members: string;
  publishedAt: string;
  thumbnail: string;
  duration: number;
  durationAsString: string;
  url: string;
}

type HomeProps = {
  lastestEpisodes: Array<Episode>,
  allEpisodes: Array<Episode>
}
/* ----------------------- SPA ------------------------ */
// import { useEffect } from 'react'
// export default function Home () {
// useEffect(() => {
//   fetch('http://localhost:3333/episodes')
//     .then(response => response.json())
//     .then(data => console.log(data))
// }, [])

// SSR

//   return (
//     <div />
//   )
// }
/* ----------------------- SSR ------------------------ */
// SSR
// export default function Home (props) {
//   console.log(props.episodes)

//   return (
//     <div>{JSON.stringify(props.episodes)}</div>
//   )
// }

// export async function getServerSideProps () {
//   const response = await fetch('http://localhost:3333/episodes')
//   const data = await response.json()

//   return {
//     props: {
//       episodes: data
//     }
//   }
// }

/* ------------------------ SSG ----------------------- */
export default function Home({ lastestEpisodes, allEpisodes }: HomeProps) {
  const { playList } = usePlayer()
  const episodeList = [...lastestEpisodes, ...allEpisodes]

  return (
    <div className={styles.homepage}>
      <Head>
        <title>Home | Podcaster</title>
      </Head>
      <section className={styles.lastestEpisodes}>
        <h2>Últimos lançamentos</h2>
        <ul>
          {lastestEpisodes.map((episode, index) => {
            return (
              <li key={episode.id}>
                <Image width={192} height={192} objectFit='cover' src={episode.thumbnail} alt={episode.title} />
                <div className={styles.episodeDetails}>
                  <Link href={`/episodes/${episode.id}`}>
                    <a>{episode.title}</a>
                  </Link>
                  <p>{episode.members}</p>
                  <span>{episode.publishedAt}</span>
                  <span>{episode.durationAsString}</span>
                </div>
                <button type='button' onClick={() => playList(episodeList, index)}>
                  <img src="/play-green.svg" alt="Play" />
                </button>
              </li>
            )
          })}
        </ul>
      </section>
      <section className={styles.allEpisodes}>
        <h2>Todos epissódios</h2>
        <table cellSpacing={0}>
          <thead>
            <tr>
              <th></th>
              <th>Podcast</th>
              <th>Integrantes</th>
              <th>Data</th>
              <th>Duração</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {allEpisodes.map((episode, index) => {
              return (
                <tr key={episode.id}>
                  <td style={{ width: 72 }}>
                    <Image width={120} height={120} objectFit='cover' src={episode.thumbnail} alt={episode.title} />
                  </td>
                  <td>
                    <Link href={`/episodes/${episode.id}`}>
                      <a>{episode.title}</a>
                    </Link>
                  </td>
                  <td>
                    <p>{episode.members}</p>
                  </td>
                  <td style={{ width: 100 }}>
                    <span>{episode.publishedAt}</span>
                  </td>
                  <td>
                    <span>{episode.durationAsString}</span>
                  </td>
                  <td>
                    <button type='button' onClick={() => playList(episodeList, index + lastestEpisodes.length)}>
                      <img src="/play-green.svg" alt="Play" />
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </section>
    </div>
  )
}

export const getStaticProps: GetStaticProps = async () => {
  const { data } = await api.get('episodes', {
    params: {
      _limit: 12,
      sort: 'published_at',
      order: 'desc'
    }
  })

  //formatar resultados
  const episodes = data.map(({ id, title, members, thumbnail, published_at, description, file }) => {
    return {
      id,
      title,
      members,
      thumbnail,
      publishedAt: format(parseISO(published_at), 'd MMM yy', { locale: ptBR }),
      duration: Number(file.duration),
      durationAsString: convertDurationToTimeString(Number(file.duration)),
      url: file.url
    }
  })

  const lastestEpisodes = episodes.slice(0, 2);
  const allEpisodes = episodes.slice(2, episodes.length);

  return {
    props: {
      lastestEpisodes,
      allEpisodes
    },
    revalidate: 60 * 60 * 8
  }
}
