import { useState } from 'react'
import './App.css'

const PROJECT_NAME = import.meta.env.VITE_PROJECT_NAME
const BE_URL = import.meta.env.VITE_BE_URL

const METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE']
const HAS_BODY = ['POST', 'PUT', 'PATCH']

export default function App() {
  const [method, setMethod] = useState('GET')
  const [path, setPath] = useState('/users')
  const [body, setBody] = useState('')
  const [loading, setLoading] = useState(false)
  const [response, setResponse] = useState(null)

  const handleSend = async () => {
    setLoading(true)
    setResponse(null)

    const url = `${BE_URL}${path.startsWith('/') ? path : '/' + path}`
    const options = {
      method,
      headers: { 'Content-Type': 'application/json' },
    }
    if (HAS_BODY.includes(method) && body.trim()) {
      try {
        options.body = JSON.stringify(JSON.parse(body))
      } catch {
        setResponse({ error: 'Request body가 유효한 JSON이 아닙니다.' })
        setLoading(false)
        return
      }
    }

    const startTime = Date.now()
    try {
      const res = await fetch(url, options)
      const elapsed = Date.now() - startTime
      const text = await res.text()
      let data
      try { data = JSON.parse(text) } catch { data = text }
      setResponse({ status: res.status, ok: res.ok, data, elapsed, url })
    } catch (err) {
      setResponse({ error: err.message })
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) handleSend()
  }

  return (
    <div className="app">
      <header className="header">
        <div className="header-inner">
          <div className="logo">{PROJECT_NAME}</div>
          <div className="be-url">
            <span className="be-label">BE</span>
            <span className="be-value">{BE_URL}</span>
          </div>
        </div>
      </header>

      <main className="main">
        <section className="welcome">
          <h1>Welcome to <strong>{PROJECT_NAME}</strong></h1>
          <p>같은 스테이지의 API 서버를 호출하고 응답을 확인할 수 있습니다.</p>
        </section>

        <section className="explorer">
          <div className="request-bar">
            <select
              className={`method method-${method.toLowerCase()}`}
              value={method}
              onChange={e => setMethod(e.target.value)}
            >
              {METHODS.map(m => <option key={m}>{m}</option>)}
            </select>
            <input
              className="path-input"
              type="text"
              value={path}
              onChange={e => setPath(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="/users"
              spellCheck={false}
            />
            <button
              className="send-btn"
              onClick={handleSend}
              disabled={loading}
            >
              {loading ? '...' : 'Send'}
            </button>
          </div>

          {HAS_BODY.includes(method) && (
            <textarea
              className="body-input"
              value={body}
              onChange={e => setBody(e.target.value)}
              placeholder='{"key": "value"}'
              rows={5}
              spellCheck={false}
            />
          )}

          {response && (
            <div className="response">
              {response.error ? (
                <div className="response-error">{response.error}</div>
              ) : (
                <>
                  <div className="response-meta">
                    <span className={`status-badge ${response.ok ? 'ok' : 'fail'}`}>
                      {response.status}
                    </span>
                    <span className="elapsed">{response.elapsed}ms</span>
                    <span className="response-url">{response.url}</span>
                  </div>
                  <pre className="response-body">
                    {typeof response.data === 'string'
                      ? response.data
                      : JSON.stringify(response.data, null, 2)}
                  </pre>
                </>
              )}
            </div>
          )}
        </section>
      </main>
    </div>
  )
}
