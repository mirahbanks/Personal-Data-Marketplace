;; Pricing Contract

(define-constant CONTRACT_OWNER tx-sender)

(define-map data-prices
  { data-type: (string-ascii 64) }
  { price: uint }
)

(define-public (set-price (data-type (string-ascii 64)) (price uint))
  (begin
    (asserts! (is-eq tx-sender CONTRACT_OWNER) (err u403))
    (ok (map-set data-prices { data-type: data-type } { price: price }))
  )
)

(define-read-only (get-price (data-type (string-ascii 64)))
  (default-to u0 (get price (map-get? data-prices { data-type: data-type })))
)

