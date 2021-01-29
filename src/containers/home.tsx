import styles from 'home.module.css'
import {set} from '../lib/database'
import {getParams} from '../lib/browser'
import {useEffect} from 'react';

export default function Home() {
  const url = `https://www.beeminder.com/apps/authorize?client_id=${process.env.BM_CLIENT_ID}&redirect_uri=${encodeURIComponent(process.env.APP_URL)}`

  const params = getParams()
  const username = params.get('username')
  const access_token = params.get('access_token')

  console.log(set)

  useEffect(() => {
    console.log('running effect')

    set(`user_${username}`, access_token)
  }, [username, access_token, set])

  return <>
  <a href={url}>Authenticate</a>
  </>
}