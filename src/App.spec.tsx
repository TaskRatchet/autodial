import React from 'react';
import {render, waitFor} from '@testing-library/react';
import App from './App';

import { getParams } from './lib/browser'
import {setUserAuth} from './lib/database'

jest.mock('./lib/browser')
jest.mock('./lib/database')
jest.mock('./lib/firebase')

const mockGetParams = getParams as jest.Mock
const mockSetUserAuth = setUserAuth as jest.Mock

function loadParams(params: string) {
  mockGetParams.mockReturnValue(new URLSearchParams(params))
}

describe('Home page', () => {
  beforeEach(() => {
    mockGetParams.mockReturnValue(new URLSearchParams(''));
    mockSetUserAuth.mockResolvedValue(null);
  })

  it('has authenticate button', async () => {
    const { getByText } = await render(<App />)

    expect(getByText('Login with Beeminder')).toBeInTheDocument()
  })

  it('links authenticate link', async () => {
    const { getByText } = await render(<App />)

    const link = getByText('Login with Beeminder') as any

    expect(link.parentElement.href).toContain('https://www.beeminder.com/apps/authorize')
  })

  describe('with mocked env', () => {
    const OLD_ENV = process.env;

    beforeEach(() => {
      jest.resetModules()
      process.env = { ...OLD_ENV };
    });

    afterAll(() => {
      process.env = OLD_ENV;
    });

    it('includes client id in authenticate url', async () => {
      process.env.REACT_APP_BM_CLIENT_ID = 'the_client_id'

      const { getByText } = await render(<App />)

      const link = getByText('Login with Beeminder') as any

      expect(link.parentElement.href).toContain('the_client_id')
    })

    it('includes client secret in authenticate url', async () => {
      process.env.REACT_APP_APP_URL = 'http://the_app_url'

      const { getByText } = await render(<App />)

      const link = getByText('Login with Beeminder') as any

      expect(link.parentElement.href).toContain(encodeURIComponent('http://the_app_url'))
    })
  })

  it('persists credentials', async () => {
    loadParams('?access_token=abc123&username=alice')

    await render(<App />)

    await waitFor(() => {
      expect(setUserAuth).toBeCalledWith('alice', 'abc123')
    })
  })

  it('does not persist credentials if none passed', async () => {
    loadParams('')

    await render(<App />)

    expect(setUserAuth).not.toBeCalled()
  })
})

// TODO:
// displays authenticated username
// hides authenticate button when authenticated
// displays disconnect button when authenticated
// disconnect button sets active=false in firestore
// authenticate button sets active=true in firestore
// disconnect button clears get params from url
// add route to handle de-authorizing the app from Beeminder side
