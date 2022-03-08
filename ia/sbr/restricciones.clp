
;
;   SEMÁFORO. Ejemplo 1
;

(defrule no-cruzar
    (luz ~verde) ; Hay un hecho (luz 'algo'), pero no es (luz verde)
    ;(not (luz verde)) ; No existe el hecho (luz verde)
    =>
    (printout t "No cruce" crlf)
)

(defrule precaucion
    (luz amarilla|intermitente)
    =>
    (printout t "Cruce con precaución" crlf)
)

(defrule puedo-cruzar
    (luz ~rojo & ~amarilla)
    =>
    (printout t "Puede cruzar" crlf)
)


;
;   Comprobar valor de un campo. Ejemplo 2
;

(defrule r1
    (valor ?x & :(> ?x 0))
    ;(test (> ?x 0))
=>
    (printout t ?x crlf)
)