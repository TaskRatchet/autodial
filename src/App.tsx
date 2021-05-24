import React from 'react';
import './App.css';
import {setUserAuth} from './lib/database'
import {getParams} from './lib/browser'
import {useEffect} from 'react';

function App() {
    const app_url = process.env.APP_URL || '';
    const url = `https://www.beeminder.com/apps/authorize?client_id=${process.env.BM_CLIENT_ID}&redirect_uri=${encodeURIComponent(app_url)}`
    const params = getParams()
    const username = params.get('username')
    const access_token = params.get('access_token')

    useEffect(() => {
        if (!username || !access_token) return

        setUserAuth(username, access_token).then(() => {
            // TODO: handle then
        }).catch(() => {
            // TODO: handle catch
        })
    }, [username, access_token, setUserAuth])

    return <>
        <a href={url}>Authenticate</a>
    </>
}

export default App;
