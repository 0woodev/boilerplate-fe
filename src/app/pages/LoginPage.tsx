import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/app/AuthProvider'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from '@/hooks/use-toast'
import { ApiError } from '@/lib/api'

export function LoginPage() {
  const { login, register } = useAuth()
  const navigate = useNavigate()

  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [isPending, setIsPending] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsPending(true)

    try {
      if (mode === 'login') {
        await login(username, password)
      } else {
        await register(username, password)
      }
      navigate('/', { replace: true })
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : '알 수 없는 오류가 발생했습니다.'
      toast({
        variant: 'destructive',
        title: mode === 'login' ? '로그인 실패' : '회원가입 실패',
        description: message,
      })
    } finally {
      setIsPending(false)
    }
  }

  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-background px-4">
      <Card className="w-full max-w-[400px]">
        <CardHeader className="text-center">
          <CardTitle className="text-xl">
            {mode === 'login' ? '로그인' : '회원가입'}
          </CardTitle>
          <CardDescription>
            {mode === 'login'
              ? '계정에 로그인하세요.'
              : '새 계정을 만드세요.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">사용자명</Label>
              <Input
                id="username"
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="username"
                required
                autoComplete="username"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">비밀번호</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="password"
                required
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              />
            </div>

            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending
                ? '처리 중...'
                : mode === 'login'
                  ? '로그인'
                  : '회원가입'}
            </Button>
          </form>

          <div className="mt-4 text-center text-sm text-muted-foreground">
            {mode === 'login' ? (
              <button
                type="button"
                className="underline hover:text-foreground"
                onClick={() => setMode('register')}
              >
                계정이 없으신가요? 회원가입
              </button>
            ) : (
              <button
                type="button"
                className="underline hover:text-foreground"
                onClick={() => setMode('login')}
              >
                이미 계정이 있으신가요? 로그인
              </button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
