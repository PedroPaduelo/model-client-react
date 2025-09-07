export default function Login() {
  return (
    <div>
      <h1>Login</h1>
      <form style={{ display: 'grid', gap: 8, maxWidth: 320 }} onSubmit={(e) => e.preventDefault()}>
        <label>
          Email
          <input type="email" name="email" placeholder="email@exemplo.com" required />
        </label>
        <label>
          Senha
          <input type="password" name="password" placeholder="••••••••" required />
        </label>
        <button type="submit">Entrar</button>
      </form>
    </div>
  )
}
