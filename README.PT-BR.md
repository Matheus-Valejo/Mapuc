#MAPUC

A janela de mapa escala por padrão para 760x760. Usando um argumento `--puc-map-size` no componente para mudar o tamanho
```html
<puc-map style="--puc-map-size: 600px"></puc-map>
```

## Localização em tempo real

Clique no botão de alvo abaixo dos controles de zoom e autorize a localização no
navegador. O ponto azul acompanha a posição e o círculo indica a precisão estimada.
Arrastar o mapa mantém a atualização do ponto; clicar no alvo centraliza novamente.
Com o acompanhamento centralizado, outro clique desativa a localização.

O mapa cobre apenas a PUC-Rio: posições fora dos limites geram um aviso e não são
desenhadas dentro do campus. A localização não é solicitada ao carregar a página,
nem armazenada ou enviada a um servidor pelo componente. O acompanhamento termina
ao desligar o controle ou remover o componente.

Use HTTPS em produção ou localhost no desenvolvimento. Em um iframe de outra
origem, o site que incorpora o mapa precisa permitir geolocalização com
`allow="geolocation"` e uma política de permissões compatível. A disponibilidade
e a precisão dependem do dispositivo, do navegador e das permissões concedidas.
