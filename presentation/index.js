import React, { Fragment } from 'react'
import {
  Deck,
  Slide,
  List,
  ListItem,
  Text as SText,
  Heading as SHeading,
  Appear as SAppear,
  Image as SImage,
  Layout,
  Fill,
  CodePane,
  Link as SLink,
  Code,
  S,
 } from 'spectacle'
import QRCode from 'qrcode.react'
import styled from '@emotion/styled'
import CodeSlideComponent from 'spectacle-code-slide'

import createTheme from 'spectacle/lib/themes/default'

const notnormalmode = location.hash.indexOf('?') > 0
const presentermode = location.hash.indexOf('?presenter') > 0

if (notnormalmode) {
  document.body.classList.add('notnormalmode')
}

const images = {
  juusto: require('../assets/juusto.gif'),
  vincit: require('../assets/vincit.svg'),
  leaving: require('../assets/leaving.gif'),
  xzbitwtf: require('../assets/xzibit-wtf.jpg'),
  yodawg: require('../assets/xzibithappy.jpg'),
  thisisfine: require('../assets/thisisfine.gif'),
  oauth: require('../assets/oauth-client.png'),
  plsnocookies: require('../assets/nodonotdothat.png'),
  saucehtmlprerendered: require('../assets/saucehtmlprerendered.png'),
  saucehtml: require('../assets/saucehtml.png'),
  gtm: require('../assets/gtm.png'),
  gun: require('../assets/gun.gif'),
  goodWork: require('../assets/good-work.gif'),
  matrix: require('../assets/matrix.jpg'),
  lookintoit: require('../assets/lookintoit.jpg'),
  termResponse: require('../assets/term-response.png'),
  viewCategory: require('../assets/view-category.png'),
}

const Vincit = styled(({ className }) => (
  <img src={images.vincit} className={className} />
))`
  position: fixed;
  top: 10px;
  right: 10px;
  max-width: 200px;
  height: auto;
`

// Require CSS
require('normalize.css')

const colours = {
  // primary: '#222222',
  primary: '#000000',
  secondary: '#f1f1f1',
  tertiary: '#f226b1',
  quaternary: '#CECECE',
}
const fonts = {
  primary: '"Press Start 2P"',
  secondary: '"Source Sans Pro"',
  tertiary: '"Source Code Pro"',
}
const theme = createTheme(
  {
    ...colours,
  },
  {
    ...fonts,
  },
)

theme.screen.progress.bar.bar = {
  ...theme.screen.progress.bar.bar,
  background: colours.tertiary,
}

theme.screen.components.codePane = {
  ...theme.screen.components.codePane,
  fontSize: '2rem',
  // maxWidth: '900px',
  // minWidth: 'none',
}

theme.screen.components.text = {
  ...theme.screen.components.text,
  fontFamily: fonts.secondary,
}

theme.screen.components.heading.h2 = {
  ...theme.screen.components.heading.h2,
  color: theme.screen.components.heading.h1.color,
}

theme.screen.components.heading.h3 = {
  ...theme.screen.components.heading.h3,
  color: theme.screen.components.heading.h1.color,
}

theme.screen.components.heading.h4 = {
  ...theme.screen.components.heading.h4,
  color: theme.screen.components.heading.h1.color,
}

theme.screen.components.heading.h5 = {
  ...theme.screen.components.heading.h5,
  color: theme.screen.components.heading.h1.color,
}

theme.screen.global.body = {
  ...theme.screen.global.body,
  fontSize: '1.2rem',
  fontFamily: fonts.secondary,
  // maxWidth: '900px',
  // minWidth: 'none',
}

console.log('theme', theme)
console.log('screen', `${window.innerWidth}x${window.innerHeight}`)

// const Appear = notnormalmode && !presentermode ? ({ children }) => <div style={{ opacity: 0.7, display: 'inline-block' }}>{children}<sub>(faded in)</sub></div> : SAppear
const Appear = SAppear
const Iframe = notnormalmode ? ({ src }) => <div>iframe: {src}</div> : (props) => <iframe {...props} />

let removableSlideCount = 0
class MaybeRemove extends React.Component {
  componentDidMount() {
    removableSlideCount++
  }

  componentWillUnmount() {
    removableSlideCount--
  }

  render() {
    return notnormalmode ? '(probably removed due to time constraints)' : null
  }
}

const TextBase = ({ children, ...rest }) => (
  <SText textColor="secondary" {...rest}>{children}</SText>
)

const Text = styled(TextBase)`
  margin-left: auto !important;
  margin-right: auto !important;
  margin: 1rem auto !important;
  max-width: 900px;
`

const Heading = styled(SHeading)`
  margin: 0;
  margin-bottom: 2rem;
`

const Image = styled(SImage)`
  margin-top: 2rem !important;
  margin-bottom: 2rem !important;
`

const Indicator = styled(({ verticalMode, className }) => (
  <span className={className}>{verticalMode ? 'V' : 'H'}</span>
))`
  position: fixed;
  top: 0;
  left: 0;
  z-index: 999;
`

const QR = ({ value }) => (
  <QRCode value={value} renderAs="svg" size={150} bgColor={colours.secondary} fgColor={colours.tertiary} includeMargin={true}  />
)

const Link = ({ children, QR = true, ...rest }) => (
  <SLink textColor="tertiary" {...rest} margin="1rem 0;">{children}</SLink>
)

const extractNumberFromString = x => {
  const matches = x.match(/\d.*/gm)
  const value = matches ? parseInt(matches[0], 10) : null

  return value ? value : null
}

export default class Presentation extends React.Component {
  constructor(props) {
    super(props)

    this.handleShittyRemote = this.handleShittyRemote.bind(this)
    this.guessTheSlide = this.guessTheSlide.bind(this)

    this.slideNumber = extractNumberFromString(window.location.hash) // Including it in state causes rerenders

    this.state = {
      verticalMode: false,
      codeSlideComponent: CodeSlideComponent,
    }
  }


 // Hack: listen to remote keys and move up and down in code slides
  handleShittyRemote(e) {
    const { slideNumber: number, state } = this
    const { verticalMode} = state
    const lsKey = `code-slide:${number}`
    const currentRange = (parseInt(localStorage.getItem(lsKey), 10) || 0)


    // The "fullscreen" key on the remote
    if (e.code === 'Period') {
      console.log('changing mode to ', !verticalMode)
      this.setState({
        verticalMode: !verticalMode,
      })
    }

    if (verticalMode) {
      // The prev & next slide keys on the remote
      if (e.key === 'PageUp') {
        this.setState({
          codeSlideComponent: () => null,
        }, () => {
          const newRange = currentRange - 1
          localStorage.setItem(lsKey, newRange)

          this.setState({
            codeSlideComponent: CodeSlideComponent,
          })
        })
      } else if (e.key === 'PageDown') {
        this.setState({
          codeSlideComponent: () => null,
        }, () => {
          const newRange = currentRange + 1
          localStorage.setItem(lsKey, newRange)

          this.setState({
            codeSlideComponent: CodeSlideComponent,
          })
        })
      }

      e.preventDefault()
      e.stopPropagation()
      return false;
    }
  }

  guessTheSlide(e) {
    const { newURL } = e
    const url = new URL(newURL)

    this.slideNumber = extractNumberFromString(url.hash)
  }

  componentDidMount() {
    window.addEventListener('keydown', this.handleShittyRemote, {
      capture: true,
      passive: false,
    })
    window.addEventListener('hashchange', this.guessTheSlide)

    setTimeout(() => {
      console.log({ removableSlideCount })
    }, 3000)
  }

  render() {
    const { verticalMode, codeSlideComponent: CodeSlide } = this.state

    const presentation = (
      <Deck
        transition={['zoom', 'slide']}
        transitionDuration={500}
        progress="bar"
        theme={theme}
      >
        <Slide transition={['fade']} />
        <Slide transition={['fade']}>
          <Appear><div>
            <Heading size={2} lineHeight={1.2} textAlign="left">
              R<Appear><span style={{ color: colours.secondary }}>evamping</span></Appear><br />
              A<br />
              W<Appear><span style={{ color: colours.secondary }}>eb</span></Appear><br />
              S<Appear><span style={{ color: colours.secondary }}>ervice</span></Appear><br />
              W<Appear><span style={{ color: colours.secondary }}>ith</span></Appear><br />
              A<br />
              R<Appear><span style={{ color: colours.secondary }}>eact</span></Appear><br />
              S<Appear><span style={{ color: colours.secondary, whiteSpace: 'nowrap' }}>ingle page app</span></Appear><br />
              {/* Revamping a web service with a React SPA */}
            </Heading>
          </div></Appear>
        </Slide>

        <Slide>
          <Heading size={2}>
            A what?
          </Heading>

          <Iframe
            src="https://tekniikanmaailma.fi"
            width="1024"
            height="768"
            style={{ border: 0, margin: '10px', border: `1px solid ${colours.tertiary}` }}
            />
        </Slide>

        <Slide>
          <Iframe
            width="1920"
            height="1080" src="https://www.youtube.com/embed/3Z9yK3sMDUU?rel=0&amp;controls=0&amp;showinfo=0&amp;autoplay=1"
            frameBorder="0"
            allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture;"
            style={{
              position: 'fixed',
              top: '-5vh',
              left: 0,
              right: 0,
              bottom: 0,
              height: '110vh',
              width: '100vw',
            }}
            autoPlay
            allowFullScreen />
        </Slide>

        <Slide>
          <Heading size={2}>
            WHY?
          </Heading>

          <List>
            <Appear>
              <ListItem>
                MVP to see if headless WP suits the client's purposes
              </ListItem>
            </Appear>

            <Appear>
              <ListItem>
                New digital magazine
              </ListItem>
            </Appear>

            <Appear>
              <ListItem>
                Building foundations for the whole media group
              </ListItem>
            </Appear>

            <Appear>
              <ListItem>
                Adoption of modern software development practices
              </ListItem>
            </Appear>

            <Appear>
              <ListItem>
                The old theme driven site was looking, and feeling old
              </ListItem>
            </Appear>
          </List>
        </Slide>

        <Slide>
          <Heading size={2}>
            How?
          </Heading>

          <List>
            {/* <Appear>
              <ListItem>
                Iteration
              </ListItem>
            </Appear> */}

            <Appear>
              <ListItem>
                add_filter() &amp; add_action()
              </ListItem>
            </Appear>

            <Appear>
              <ListItem>
                Few thousand lines of custom plugin code

                <List>
                  <ListItem>URL resolver</ListItem>
                  <ListItem>API customizations</ListItem>
                </List>
              </ListItem>
            </Appear>

            <Appear>
              <ListItem>
                composer-patches &amp; patch-package for abandonware patches
              </ListItem>
            </Appear>

            <Appear>
              <ListItem>
                Continuous Integration
              </ListItem>
            </Appear>

            <Appear>
              <ListItem>
                nginx, memcached, Puppeteer, ACF to REST API, WP REST API Menus, WP Libre Form, WP_Query Route to REST API, React, CSS Modules, Jest, Redux,
                Redux-Saga, Kea, React Router, React Modal, React Helmet, styled-components,
                axios, html-react-parser, localForage
              </ListItem>
            </Appear>
          </List>
        </Slide>

        <Slide bgImage={images.juusto}>
          <Heading size={2} lineHeight={1} textColor="tertiary">
            Problems<br />
            &amp;<br />
            solutions
          </Heading>
        </Slide>

        <Slide>
          <Heading size={2}>
            SEO &amp; SOME
          </Heading>

          <Text textColor="secondary" bold>
            Serving Google and Facebook something other than "Loading..."
          </Text>
        </Slide>

        <Slide bgImage={images.saucehtml} bgSize="contain" bgRepeat="no-repeat" bgDarken={0.8}>
          <Text>
            The new version isn't server rendered. Crawlers that do not execute JavaScript or wait for async actions to complete get a pretty crude page.
          </Text>
        </Slide>

        <Slide>
          <Text>
            That won't do. Puppeteer to the rescue!
          </Text>

          <Appear><div>
            <Text>
              Puppeteer is a Node library for Google Chrome. It allows us to simulate user interaction and run code.
            </Text>
          </div></Appear>
        </Slide>

        <Slide>
          <Text>
            The basic idea is to run a Node server that runs Puppeteer, and route to that server from nginx.
          </Text>

          <Appear><div>
            <Text>
              It can be done for all users, users that aren't logged in, or just bots, bots being the easiest to implement.
            </Text>
          </div></Appear>
        </Slide>

        <CodeSlide
          ranges={[
            { loc: [0, 4] },
            { loc: [7, 11], title: "List useragents which should get SSR'd content" },
            { loc: [15, 21], title: "Route to the prerenderer" },
          ]}
          lang="nginx"
          code={require('raw-loader!./codesnippets/prerender.nginx')}
          overflow="overflow"
          />

        <Slide>
          <Text>
            We run things a bit differently for Puppeteer. We append ?headless=true to the URL and various tweaks around the application happen.
          </Text>

          <Appear><div>
            <Text>
              How does the Puppeteer server know when the page is ready?
            </Text>
          </div></Appear>
        </Slide>

        <CodeSlide
          ranges={[
            { loc: [0, 2], title: "By telling it what to look for"  },
            { loc: [21, 37], title: "Then wait and extract"  },
            { loc: [2, 12], title: "Btw, loading images is unnecessary"  },
          ]}
          lang="js"
          code={require('raw-loader!./codesnippets/ssr.js.sample')}
          overflow="overflow"
          />

        <CodeSlide
          ranges={[
            { loc: [0, 10], title: "But what sets READY_TO_RENDER?" },
            { loc: [13, 16], title: "Container component sets it off" },
            { loc: [2, 5], title: "Prevent interaction for bots" },
          ]}
          lang="js"
          code={require('raw-loader!./codesnippets/ready.js.sample')}
          overflow="overflow"
          />

        <Slide bgImage={images.saucehtmlprerendered} bgSize="contain" bgRepeat="no-repeat" bgDarken={0.8}>
          <Text>
            Now we have full content and meta tags.
          </Text>

          <Appear><div>
            <Text>But a lot of CSS was missing.</Text>
          </div></Appear>
        </Slide>

        <CodeSlide
          ranges={[
            { loc: [11, 16] },
            { loc: [0, 17] },
            { loc: [18, 27], title: "Abuse the secret API" },
          ]}
          lang="js"
          code={require('raw-loader!./codesnippets/ghosts.js.sample')}
          overflow="overflow"
          />

        <Slide>
          <Heading siz={2}>
            Prerendered site
          </Heading>

          <Text>(not public so not shown)</Text>
        </Slide>

        <Slide>
          <Heading size={2} lineHeight={1}>
            Building the new without breaking the old
          </Heading>
        </Slide>

        <Slide>
          <Text>
            The old themebased site had to remain as-is, but we had to make changes to the backend in order to build the new site.
          </Text>

          <Appear><div>
            <div>
              <Text>
                This was surprisingly easy.
              </Text>
            </div>
          </div></Appear>
        </Slide>

        <CodeSlide
          ranges={[
            { loc: [2, 8] },
            { loc: [9, 14] },
            { loc: [18, 20] },
            { loc: [21, 23] },
            { loc: [24, 26] },
            // { loc: [28, 38] },
            // { loc: [39, 55] },
          ]}
          lang="php"
          theme="dark"
          code={require('raw-loader!./codesnippets/rest-general.php')}
          overflow="overflow"
        />

        <CodeSlide
          ranges={[
            { loc: [21, 41], title: "Change menuitem url to the most recent issue" },
            { loc: [42, 45], title: "Add our parameters to a query", note: 'We need to show future issues as well' },
            { loc: [46, 52], title: "Remove an ACF field from API response" },
          ]}
          lang="php"
          code={require('raw-loader!./codesnippets/rest-filters.php')}
          overflow="overflow"
        />

        <Slide bgImage={images.gun}>
          <Heading size={2}>
            Clicking a link sometimes causes a full page reload
          </Heading>

          <Appear><div>
            <Text textColor="quaternary" bold>
              Which is pretty bad if low end devices take 30 seconds to render
            </Text>
          </div></Appear>
        </Slide>

        <Slide>
          <Text>
            A few months ago, we started noticing that sometimes when you clicked a link, it caused a full page reload, instead of seamlessly transitioning.
          </Text>

          <Appear><div>
            <Text>
              We tried debugging it, but reproducing it was very hard. The problem got worse and worse.
            </Text>
          </div></Appear>

          <Appear><div>
            <Text>
              Finally, our tech lead isolated the problem to Google Tag Manager.
            </Text>
          </div></Appear>
        </Slide>

        <Slide>
          <Text>
            Fixing the problem was easy, locating the problem was the hard part.
          </Text>

          <Appear><div>
            <Image src={images.gtm} />
          </div></Appear>

          <Appear><div>
            <Text>We had a similar problem with Frosmo as well.</Text>
          </div></Appear>

        </Slide>

        <Slide bgImage={images.matrix}>
          <Heading size={2}>
            Cache invalidation
          </Heading>

          <Text color="quaternary" bold>
            Definitely harder than naming things
          </Text>
        </Slide>

        <Slide>
          <Text>Let's do the easy ones first.</Text>

          <List>
            <Appear><div>
              <ListItem>
                CSS, JS, SVGs etc: Use md5 hash in filename
              </ListItem>
            </div></Appear>

            <Appear><div>
              <ListItem>
                ???
              </ListItem>
            </div></Appear>

            <Appear><div>
              <ListItem>
                ???
              </ListItem>
            </div></Appear>
          </List>
        </Slide>

        <Slide>
          <Heading size={2}>
            WordPress Transients
          </Heading>

          <List>
            <Appear>
              <ListItem>
                Better class-based API

                <div style={{ marginLeft: '2rem'}}>
                  <List>
                    <ListItem>
                      Predictable transient names:<br />
                      <Code textColor="secondary">omf_om/v1_digimag_issue_md5($params)</Code><br />
                      <Code textColor="secondary">$prefix_$route_$path_md5($params)</Code>
                    </ListItem>

                    <ListItem>
                      <S type="strikethrough">
                          Prefetch: populate transients just when they expire
                      </S>
                    </ListItem>

                    <ListItem>
                      <S type="strikethrough">
                        A list of transients, with meta
                      </S>
                    </ListItem>

                    <ListItem>
                      <S type="strikethrough">
                        Inception-mode (transient within transient)
                      </S>
                    </ListItem>
                  </List>
                </div>
              </ListItem>
            </Appear>
            <Appear>
              <ListItem>
                Cacheproxy endpoint for 3rd party or "native" endpoints
              </ListItem>
            </Appear>
            <Appear>
              <ListItem>
                Automagical transients for all custom API endpoints
              </ListItem>
            </Appear>
            <Appear>
              <ListItem>
                Ugly maintenance class to clean it all up
              </ListItem>
            </Appear>
          </List>
        </Slide>

        <Slide>
          <Text>
            Unfortunately, because we could only use memcached, the "smart" solution didn't run very well in production.
          </Text>

          <Appear><div>
            <Text>
              Memcacheds maximum value size is 1MB, the list of transients quickly got to 4MB, so I tried storing it it wp_options.
            </Text>
          </div></Appear>

          <Appear><div>
            <Text>
              PHP could handle the 4MB value without breaking a sweat, but MySQL choked on it in a traffic spike.
            </Text>
          </div></Appear>

          <Appear><div>
            <Text>
              So production crashed. A few times.
            </Text>
          </div></Appear>

          <Appear><div>
            <Text>
              After that we simplified a bit, and left out the list, prefetch and Inception-mode.
            </Text>
          </div></Appear>
        </Slide>

        <Slide>
          <Text>
            System like this could work wonderfully with Redis, or any LRU-cache with a sensible value size limit.
          </Text>

          <Appear><div>
            <Text>
              We ran it over a weekend, and the list size didn't go higher than 4MB, so you're going to have to have a LOT
              more transients before PHP performance becomes an issue.
            </Text>
          </div></Appear>
        </Slide>

        <Slide>
          <Text>
            The code in the following slides is put together from old and new code, and may or may not run. Probably does, but be aware of the mistakes in them.
          </Text>

          <Appear><div>
            <Image src={images.lookintoit} />
          </div></Appear>

          <Appear><div>
            <Text>
              I will publish a toolkit plugin containing similar features than the ones I built for this project, as soon as I have the time to write it.
            </Text>
          </div></Appear>
        </Slide>

        <CodeSlide
          ranges={[
            { loc: [9, 32] },
            { loc: [32, 41], note: 'These values have the potential to get huge, store in Redis instead' },
            { loc: [49, 83] },
            { loc: [86, 109] },
            { loc: [110, 120] },
            { loc: [120, 136] },
            { loc: [136, 177] },
            { loc: [185, 188] },
          ]}
          lang="php"
          code={require('raw-loader!./codesnippets/class.transientify.php')}
        />

        <CodeSlide
          ranges={[
            { loc: [0, 21], title: 'Category API endpoints' },
            { loc: [21, 38], title: 'Endpoint code' },
          ]}
          lang="php"
          code={require('raw-loader!./codesnippets/rest-route-category.php')}
        />

        <CodeSlide
          ranges={[
            { loc: [0, 18], title: 'Root of all data' },
            { loc: [26, 31], title: 'The magic behind the autotransient: "middleware"' },
            { loc: [37, 68], title: 'Inject "middleware" 1/2' },
            { loc: [68, 90], title: 'Inject "middleware" 2/2' },
            { loc: [90, 92], title: 'Assign route parameters' },
            { loc: [93, 102], title: 'Register the routes' },
          ]}
          lang="php"
          code={require('raw-loader!./codesnippets/class.rest-route.php')}
        />

        <CodeSlide
          ranges={[
            { loc: [0, 18], title: 'Transient cleaner' },
            { loc: [17, 49], title: 'Decide whether to clear transient' },
            { loc: [49, 63], title: 'Helper function to extract data from the key' },
            { loc: [63, 77], title: 'Get a list of transients with parsed keys' },
            { loc: [77, 100], title: 'Clear transients that match condition' },
          ]}
          lang="php"
          code={require('raw-loader!./codesnippets/class.transient-cleaner.php')}
        />

        <Slide>
          <Heading size={2}>
            localForage
          </Heading>
        </Slide>

        <Slide>
          <Text>
            Pretty much every network request made to WP is cached using localForage, which uses IndexedDB
          </Text>

          <Appear>
            <div>
            <Text>
              This is great, because it makes the application faster over time, and allows offline use
            </Text>
            </div>
          </Appear>

          <Appear>
            <div>
            <Text>
              However, if we were to make changes to the data, the application would break because the cached data isn't compatible with the components.
            </Text>
            </div>
          </Appear>

          <Appear>
            <div>
            <Text>
              Storing all requests can also take a lot of disk space.
            </Text>
            </div>
          </Appear>
        </Slide>

        <CodeSlide
          ranges={[
            { loc: [0, 23], title: 'Use versions' },
            { loc: [35, 54], title: 'Create localForage stores' },
            { loc: [55, 63], title: 'Create a wrapper class around stores to add logic' },
            { loc: [73, 91], title: 'Get data from localForage' },
            { loc: [91, 108], title: 'Compare data version with application version' },
            { loc: [109, 114], title: 'Allow using stale data' },
            { loc: [120, 135], title: 'Add some meta to the data when storing' },
          ]}
          lang="javascript"
          code={require('raw-loader!./codesnippets/localforage.js.sample')}
        />

        <Slide>
          <Text>
            By hooking that up to data retrieval functions, the data can be stored on users device.
          </Text>

          <Text>
            But that's going to keep growing forever.
          </Text>
        </Slide>

        <CodeSlide
          ranges={[
            { loc: [140, 164], title: "Let's add a LRU cache" },
            { loc: [178, 191], title: "Store data keys in MRU order" },
            { loc: [192, 207], title: "Override DiskStorage.get" },
            { loc: [208, 248], title: "Remove items" },
          ]}
          lang="javascript"
          code={require('raw-loader!./codesnippets/localforage.js.sample')}
        />

        <Slide>
          <Heading size={2}>
            Dealing with fragmented data
          </Heading>

          <Text color="secondary" bold>
            I regret not using TypeScript
          </Text>
        </Slide>

        <Slide>
          <Text>
            There's many different formats for the seemingly same data.
          </Text>

          <div style={{ maxHeight: '700px', overflow: 'hidden' }}>
            <Layout>
              <Fill>
                <CodePane
                  lang="json"
                  theme="external"
                  style={{ fontSize: '1rem', borderRight: `1px solid ${colours.tertiary}` }}
                  source={require('raw-loader!./codesnippets/nativeimage.jsonsample')}
                  />
              </Fill>

              <Fill>
                <CodePane
                  lang="json"
                  theme="external"
                  style={{ fontSize: '1rem' }}
                  source={require('raw-loader!./codesnippets/acfimage.jsonsample')}
                  />
              </Fill>
            </Layout>
          </div>
        </Slide>

        <Slide>
          <Text>
            Pretty much everything provided by airesvsg/acf-to-rest-api is in a different format.
          </Text>

          <Appear><div>
            <Text>
              We want to use the same components regardless of differences in data.
            </Text>
          </div></Appear>
        </Slide>

        <CodeSlide
          lang="js"
          code={require('raw-loader!./codesnippets/modelcode.js.sample')}
          ranges={[
            { loc: [0, 14], title: "What we wanted to do" },
            { loc: [15, 31], title: "How we did it" },
            { loc: [31, 56], title: "How we did it" },
          ]}
          />

        <Slide>
          <Heading size={2}>
            Authenticating frontend users with WordPress
          </Heading>
        </Slide>

        <Slide>
          <Heading size={3}>
            Cookies?
          </Heading>

          <Appear><div>
            <Text textColor="secondary">
              First, we wanted to use cookie based authentication, because it's easy.
            </Text>
          </div></Appear>

          <Appear><div>
            <Image src={images.plsnocookies} />
          </div></Appear>

        </Slide>

        <Slide>
          <Heading size={3}>
            Other options
          </Heading>

          <Appear><div>
            <Text>
              JWT is nice in theory, but the there are some gotchas, like token(s) not revoking on password change.
              We used it briefly.
            </Text>
          </div></Appear>
        </Slide>

        <Slide>
          <Heading size={3}>
            OAuth
          </Heading>

          <Appear><div>
            <Text>
              Setting it up was pretty easy with a commercial plugin, although it's documentation was horrid at the time.
            </Text>
          </div></Appear>

          <Appear><div>
            <Text>
              <Link href="https://wp-oauth.com">
                https://wp-oauth.com/
              </Link>
            </Text>
          </div></Appear>
        </Slide>

        <Slide>
          <Image src={images.oauth} />
        </Slide>

        <Slide>
          <Text>
            The docs suggest that we do the following, although "User Credentials" kinda implies client-side usage.
          </Text>

          <Text>
            <Link href="https://wp-oauth.com/docs/general/grant-types/user-credentials/">
              https://wp-oauth.com/docs/general/grant-types/user-credentials/
            </Link>
          </Text>
        </Slide>

        <Slide>
          <CodePane
            lang="http"
            theme="external"
            source={require('raw-loader!./codesnippets/token.curl')}
            />
        </Slide>

        <Slide bgImage={images.thisisfine}>
          <Appear><div>
            <Heading size={2}>
              What could go wrong?
            </Heading>
          </div></Appear>

          <Appear><div>
            <Text textColor="secondary" bold>
              let's do something else instead
            </Text>
          </div></Appear>
        </Slide>

        <CodeSlide
          ranges={[
            { loc: [2, 14], title: "/rest/routes/authenticate.php" },
            { loc: [15, 26], title: "/rest/routes/authenticate.php" },
          ]}
          lang="php"
          code={require('raw-loader!./codesnippets/auth.php')}
          overflow="overflow"
          />

        <Slide bgImage={images.goodWork}></Slide>

        <Slide>
          <MaybeRemove />
          <Heading size={2}>
            Changing tablet orientation broke "Use offline" feature
          </Heading>
        </Slide>

        <Slide>
          <MaybeRemove />

          <Text>
            If an user that's viewing the application with an iPad started the application in landscape, and later rotated to portrait,
            trying to download anything failed silently.
          </Text>

          <Appear><div>
            <Text>
              Starting the application in portrait and downloading something worked flawlessly. Only transition from landscape to portrait broke the process.
            </Text>
          </div></Appear>
        </Slide>

        <Slide>
          <MaybeRemove />

          <Text>
            This was a serious bug, but how a simple button causes that kind of problems?
          </Text>

          <Appear><div>
            <Text>
              Behind the button lies <S type="strikethrough">dragons</S> complex logic.
            </Text>
          </div></Appear>

          <Appear><div>
            <Text>
              An action (button click) changes Redux state, and triggers a saga which dispatches more actions and starts another saga at the end.
            </Text>
          </div></Appear>
        </Slide>

        <Slide bgImage={images.yodawg}>
          <MaybeRemove />
        </Slide>

        <Slide>
          <MaybeRemove />

          <Text>
            Several hours later, I finally figured it out.
          </Text>
        </Slide>

        <CodeSlide
          ranges={[
            { loc: [8, 20], title: "The fix" },
          ]}
          lang="js"
          code={require('raw-loader!./codesnippets/offlinebug.diff')}
          overflow="overflow"
        />

        <Slide bgImage={images.leaving}>
          <MaybeRemove />

          <Appear><div>
            <Text>
              By connecting the logic store to a component that will not unmount, the problem disappears.
            </Text>
          </div></Appear>
        </Slide>

        <Slide>
          <Heading size={2}>
            Integration testing
          </Heading>

          <Text color="secondary" bold>
            Can we abuse browsers even more?
          </Text>
        </Slide>

        <Slide>
          <Text>
            We were already using Jest for the few unit tests that we have, so we tried using Puppeteer with Jest.
          </Text>

          <Appear><div>
            <Text>
              It works nicely after the third refactor.
            </Text>
          </div></Appear>
        </Slide>

        <CodeSlide
          ranges={[
            { loc: [9, 24], title: "Jest boilerplate" },
            { loc: [24, 34], title: "Actual testing" },
            { loc: [0, 9], title: "Creating tests without running them" },
          ]}
          lang="js"
          code={require('raw-loader!./codesnippets/int-test.js.sample')}
          overflow="overflow"
          />

        <Slide>
          <Iframe
            width="1920"
            height="1080" src="https://www.youtube.com/embed/sw88Uw8WA8U?rel=0&amp;controls=0&amp;showinfo=0&amp;autoplay=1"
            frameBorder="0"
            allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture;"
            style={{
              position: 'fixed',
              top: '-5vh',
              left: 0,
              right: 0,
              bottom: 0,
              height: '110vh',
              width: '100vw',
            }}
            autoPlay
            allowFullScreen />
        </Slide>

        <Slide>
          <Heading size={2} textAlign="center" style={{ marginBottom: '2rem' }}>
            Thank you!
          </Heading>

          {/* <Layout> */}
            <div>
              <Heading size={4} textColor="secondary" textAlign="left">
                My other stuff
              </Heading>

              <List>
                <ListItem>
                  Project:&nbsp;
                  <Link href="https://github.com/libreform/wp-libre-form">
                    WP Libre Form
                  </Link>
                </ListItem>
                <ListItem>
                  Project:&nbsp;
                  <Link href="https://github.com/Vincit/wordpress">
                    vincit/wordpress
                  </Link>
                </ListItem>
                <ListItem>
                  Project:&nbsp;
                  <Link href="https://github.com/Vincit/wordpress-theme-base">
                    vincit/wordpress-theme-base
                  </Link>
                </ListItem>
                <ListItem>
                  Twitter:&nbsp;
                  <Link href="https://twitter.com/k1sul1">
                    @k1sul1
                  </Link>
                </ListItem>
                <ListItem>
                  GitHub:&nbsp;
                  <Link href="https://github.com/k1sul1">
                    @k1sul1
                  </Link>
                </ListItem>
              </List>
            </div>


            <div>
              <Heading size={4} textColor="secondary" textAlign="left">
                Rabbit holes
              </Heading>

              <List>
                <ListItem>
                  <Link href="https://wordpress.stackexchange.com/q/295471">
                    wordpress.stackexchange.com/q/295471

                    {/* <br /><br />
                    <QR value="https://wordpress.stackexchange.com/q/295471" /> */}
                  </Link>
                </ListItem>
                <ListItem>
                  <Link href="https://developers.google.com/web/tools/puppeteer/articles/ssr">
                    developers.google.com/web/tools/puppeteer/articles/ssr

                    {/* <br /><br />
                    <QR value="https://developers.google.com/web/tools/puppeteer/articles/ssr" /> */}
                  </Link>
                </ListItem>
                <ListItem>
                  <Link href="https://stackoverflow.com/q/36769478">
                    stackoverflow.com/q/36769478

                    {/* <br /><br />
                    <QR value="https://stackoverflow.com/q/36769478" /> */}
                  </Link>
                </ListItem>
              </List>
            </div>
          {/* </Layout> */}
        </Slide>

        <Slide>
          <Heading size={2}>
            Bonus content: CodeSlide navigation in this presentation
          </Heading>
        </Slide>

        <Slide>
          <Text>
            The previous slides contained some code. They were made with&nbsp;

            <Link href="https://github.com/jamiebuilds/spectacle-code-slide">
              jamiebuilds/spectacle-code-slide
            </Link>.
          </Text>

          <Appear><div>
            <Text>
              It however, did not support my remote controller.
            </Text>
          </div></Appear>
        </Slide>

        <CodeSlide
          ranges={[
            { loc: [16, 23] },
            { loc: [78, 86] },
            { loc: [24, 39] },
            { loc: [39, 65] },
            { loc: [65, 70] },
          ]}
          lang="js"
          code={require('raw-loader!./codesnippets/navigationhack.js.sample')}
          />

      </Deck>
    )

    return !notnormalmode ? (
      <Fragment>
        {presentation}
        <Vincit />
        <Indicator verticalMode={verticalMode} />
      </Fragment>
    ) : presentation
  }
}
