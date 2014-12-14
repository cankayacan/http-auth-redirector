http-auth-redirector
====================
When you implement authentication/authorization mechanism at the client side, you have to implement the followings fundamentally:
- when authentication failed, automatically redirect the user to the login page
- after a successful login, redirect the user back to the requested page
- if there is no requested page, redirect the user back to the default redirect page (usually home page or profile page)

With this angular module you can achieve these tasks with a few line of code.

## What you have to do

You have to basically configure 2 paths, 
- the path of the login page
```
authService.setLoginPath('auth/signin')
```
- the path of the default redirect page
```
authService.setDefaultRedirectPath('auth/myprofile')
```

And then after a successful authentication inform the authentication service.
```
authService.loginConfirmed();
```

the rest will be handled by this module:
