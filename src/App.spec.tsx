import React from "react";
import {queryByText, waitFor} from "@testing-library/react";
import App from './App';

import { getParams } from './lib/browser'
import {setUserAuth} from './lib/database'
import {getGoals} from "./lib/beeminder";
import {r, withMutedReactQueryLogger} from "./lib/test/helpers";

jest.mock('./lib/browser')
jest.mock('./lib/database')
jest.mock('./lib/firebase')
jest.mock('./lib/beeminder')

const mockGetParams = getParams as jest.Mock
const mockSetUserAuth = setUserAuth as jest.Mock
const mockGetGoals = getGoals as jest.Mock

function loadParams(params: string) {
  mockGetParams.mockReturnValue(new URLSearchParams(params))
}

function loadGoals(goals: Partial<Goal>[]) {
  const goals_ = goals.map((g, i) => ({
    slug: `slug_${i}`,
    fineprint: null,
    ...g
  }))

  mockGetGoals.mockResolvedValue(goals_)
}

describe('Home page', () => {
  beforeEach(() => {
    mockGetParams.mockReturnValue(new URLSearchParams(''));
    mockSetUserAuth.mockResolvedValue(null);
    loadGoals([{slug: 'the_slug'}])
    loadParams('?access_token=abc123&username=alice')
  })

  it('has authenticate button', async () => {
    loadParams('')

    const { getByText } = await r(<App />)

    expect(getByText('Enable Autodialer')).toBeInTheDocument()
  })

  it('links authenticate link', async () => {
    loadParams('')

    const { getByText } = await r(<App />)

    const link = getByText('Enable Autodialer') as any

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
      loadParams('')

      process.env.REACT_APP_BM_CLIENT_ID = 'the_client_id'

      const { getByText } = await r(<App />)

      const link = getByText('Enable Autodialer') as any

      expect(link.parentElement.href).toContain('the_client_id')
    })

    it('includes client secret in authenticate url', async () => {
      loadParams('')

      process.env.REACT_APP_APP_URL = 'http://the_app_url'

      const { getByText } = await r(<App />)

      const link = getByText('Enable Autodialer') as any

      expect(link.parentElement.href).toContain(encodeURIComponent('http://the_app_url'))
    })
  })

  it('persists credentials', async () => {
      await r(<App/>)

      await waitFor(() => {
        expect(setUserAuth).toBeCalledWith('alice', 'abc123')
      })
  })

  it('does not persist credentials if none passed', async () => {
      loadParams('')

      await r(<App/>)

      expect(setUserAuth).not.toBeCalled()

  })

  it('gets user goals', async () => {
      await r(<App/>)

      await waitFor(() => {
        expect(getGoals).toBeCalledWith('alice', 'abc123')
      })
  })

  it('displays Beeminder error message', async () => {
    await withMutedReactQueryLogger(async () => {
      mockGetGoals.mockRejectedValue("the_error_message");

      const {getByText} = await r(<App />)

      await waitFor(() => {
        expect(getByText("the_error_message")).toBeInTheDocument()
      })
    })
  })

  it('does not set user auth if bm error', async () => {
    await withMutedReactQueryLogger(async () => {
      mockGetGoals.mockRejectedValue("the_error_message");

      const {getByText} = await r(<App/>)

      await waitFor(() => {
        expect(getByText("the_error_message")).toBeInTheDocument()
      })

      expect(setUserAuth).not.toBeCalled()
    })
  })

  it('displays beeminder username', async () => {
      const {getByText} = await r(<App/>)

      await waitFor(() => {
        expect(getByText("alice")).toBeInTheDocument()
      })
  })

  it('does not display beeminder username if auth failure', async () => {
    await withMutedReactQueryLogger(async () => {
      mockGetGoals.mockRejectedValue("the_error_message")

      const {getByText, queryByText} = await r(<App/>)

      await waitFor(() => {
        expect(getByText("the_error_message")).toBeInTheDocument()
      })

      expect(queryByText("alice")).not.toBeInTheDocument()
    })
  })

  it('lists goal slugs', async () => {
    loadGoals([{slug: 'the_slug'}])

    const {getByText} = await r(<App/>)

    await waitFor(() => {
      expect(getByText("the_slug")).toBeInTheDocument()
    })
  })

  it('lists slugs alphabetically', async () => {
    loadGoals([
      {slug: 'b_slug'},
      {slug: 'a_slug'},
    ])

    const {getByText} = await r(<App/>)

    await waitFor(() => {
      const a = getByText("a_slug")
      expect(a.parentElement?.nextSibling?.firstChild?.textContent).toEqual("b_slug")
    })
  })

  it('hides goals table if user not authenticated', async () => {
    loadParams('')

    const {queryByText} = await r(<App/>)

    expect(queryByText('Here are your goals:')).not.toBeInTheDocument()
  })

  it('says whether #autodial included in goals', async () => {
    loadGoals([
      {slug: 'the_slug', fineprint: '#autodial'},
    ])

    const {getByText} = await r(<App/>)

    await waitFor(() => {
      expect(getByText('True')).toBeInTheDocument()
    })
  })

  it('displays min value', async () => {
    loadGoals([
      {slug: 'the_slug', fineprint: '#autodialMin=1'},
    ])

    const {getByText} = await r(<App/>)

    await waitFor(() => {
      expect(getByText('1')).toBeInTheDocument()
    })
  })

  it('displays negative infinity if no min set for enabled goal', async () => {
    loadGoals([
      {slug: 'the_slug', fineprint: '#autodial'},
    ])

    const {getByText} = await r(<App/>)

    await waitFor(() => {
      expect(getByText('Negative Infinity')).toBeInTheDocument()
    })
  })

  it('does not display min if autodial not enabled for goal', async () => {
    loadGoals([
      {slug: 'the_slug'},
    ])

    const {queryByText} = await r(<App/>)

    await waitFor(() => {
      expect(queryByText('Negative Infinity')).not.toBeInTheDocument()
    })
  })

  it('displays positive value', async () => {
    loadGoals([
      {slug: 'the_slug', fineprint: '#autodialMax=1'},
    ])

    const {getByText} = await r(<App/>)

    await waitFor(() => {
      expect(getByText('1')).toBeInTheDocument()
    })
  })

  it('displays positive infinity if no max set for enabled goal', async () => {
    loadGoals([
      {slug: 'the_slug', fineprint: '#autodial'},
    ])

    const {getByText} = await r(<App/>)

    await waitFor(() => {
      expect(getByText('Positive Infinity')).toBeInTheDocument()
    })
  })
})

// TODO:
// hides authenticate button when authenticated
// displays disconnect button when authenticated
// disconnect button sets active=false in firestore
// authenticate button sets active=true in firestore
// disconnect button clears get params from url
// add route to handle de-authorizing the app from Beeminder side
