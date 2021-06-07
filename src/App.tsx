import React from 'react';
import './App.css';
import {setUserAuth} from './lib/database'
import {getParams} from './lib/browser'
import {useEffect} from 'react';
import {init} from "./lib/firebase";
import Container from '@material-ui/core/Container';
import {Button} from "@material-ui/core";

init()

function App() {
    const {REACT_APP_APP_URL = '', REACT_APP_BM_CLIENT_ID = ''} = process.env
    const redirectUri = encodeURIComponent(REACT_APP_APP_URL);
    const url = `https://www.beeminder.com/apps/authorize?client_id=${REACT_APP_BM_CLIENT_ID}&redirect_uri=${redirectUri}&response_type=token`
    const params = getParams()
    const username = params.get('username')
    const accessToken = params.get('access_token')

    useEffect(() => {
        if (!username || !accessToken) return

        setUserAuth(username, accessToken).then(() => {
            // TODO: handle then
            console.log('persist auth token success')
        }).catch((e) => {
            // TODO: handle catch
            // What should we do? Re-throw? Display the error?
            console.log('persist auth token failure')
            console.log(e)
        })
    }, [username, accessToken])

    return <Container className={'App'}>
        <h1>Beeminder Autodialer</h1>
        <p>The Beeminder autodialer will automatically adjust the rate on your goals based on your historical performance.</p>
        <Button variant={'contained'} color={'primary'} href={url}>Enable Autodialer</Button>
    </Container>
}

export default App;
