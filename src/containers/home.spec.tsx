import {render, waitFor} from '@testing-library/react'
import {describe, it, expect, beforeEach} from "@jest/globals"
import Home from '../pages/index'
import { getParams } from '../lib/browser'
import { set } from '../lib/database'

jest.mock('../lib/browser')


describe('Home page', () => {
  beforeEach(() => {
    getParams.mockReturnValue(new URLSearchParams(''))
  })

  it('has authenticate button', async () => {
    const { getByText } = await render(<Home />)

    expect(getByText('Authenticate')).toBeInTheDocument()
  })

  it('links authenticate link', async () => {
    const { getByText } = await render(<Home />)

    const link = getByText('Authenticate') as HTMLLinkElement

    expect(link.href).toContain('https://www.beeminder.com/apps/authorize')
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
      process.env.BM_CLIENT_ID = 'the_client_id'

      const { getByText } = await render(<Home />)

      const link = getByText('Authenticate') as HTMLLinkElement

      expect(link.href).toContain('the_client_id')
    })

    it('includes client secret in authenticate url', async () => {
      process.env.APP_URL = 'http://the_app_url'

      const { getByText } = await render(<Home />)

      const link = getByText('Authenticate') as HTMLLinkElement

      expect(link.href).toContain(encodeURIComponent('http://the_app_url'))
    })
  })

  it('persists credentials', async () => {
    getParams.mockReturnValue(new URLSearchParams('?access_token=abc123&username=alice'))

    const { getByText } = await render(<Home />)

    await waitFor(() => {
      expect(set).toBeCalledWith('user_alice', 'abc123')
    })
  })
})