# Action Vocabulary

The set of actions available to the user agent during the perception-action loop. Actions are organized by project type.

## Web Application

| Action | Description | Playwright equivalent |
|---|---|---|
| `navigate(url)` | Go to a URL | `page.goto(url)` |
| `click(element)` | Click a visible element | `page.click(selector)` |
| `type(element, text)` | Type text into an input | `page.fill(selector, text)` |
| `select(element, option)` | Choose from a dropdown | `page.selectOption(selector, value)` |
| `scroll(direction)` | Scroll the page | `page.mouse.wheel(0, delta)` |
| `go_back` | Browser back button | `page.goBack()` |
| `wait(seconds)` | Wait for something to happen | `page.waitForTimeout(ms)` |
| `hover(element)` | Hover over an element | `page.hover(selector)` |
| `abandon` | Give up on current goal | N/A — log and move to next goal |

Element references should use **visible text or role** where possible ("click the Sign Up button"), falling back to selectors only when necessary.

## CLI Tool

| Action | Description |
|---|---|
| `run(command)` | Execute a shell command |
| `input(text)` | Send input to a running process (stdin) |
| `interrupt` | Send Ctrl+C to a running process |
| `read_help` | Run `--help` or `man` for the tool |
| `read_output` | Read and process the last command's output |
| `abandon` | Give up on current goal |

## REST/GraphQL API

| Action | Description |
|---|---|
| `request(method, url, body, headers)` | Send an HTTP request |
| `authenticate(method, credentials)` | Perform auth flow (token, session, OAuth) |
| `read_docs` | Read API documentation or OpenAPI spec |
| `follow_link(url)` | Follow a URL from a previous response |
| `abandon` | Give up on current goal |

## Desktop Application (Experimental)

| Action | Description | Tool |
|---|---|---|
| `click(x, y)` | Click at screen coordinates | `xdotool mousemove --click` |
| `click(element)` | Click accessible element by name | AT-SPI + `xdotool` |
| `type(text)` | Type text | `xdotool type` |
| `key(combo)` | Press key combination | `xdotool key` |
| `wait(seconds)` | Wait for UI to settle | `sleep` |
| `abandon` | Give up on current goal | N/A |

## Rules

- **One action per loop cycle.** Never batch actions without observing between them.
- **Prefer semantic actions.** "Click the Submit button" over "click at coordinates (340, 520)."
- **Abandon is a valid action.** If the persona would give up, give up. Record why.
- **Wait is for the user's perception of delay**, not for technical synchronization. Use it when "the page seems to be loading" not to poll an API.
