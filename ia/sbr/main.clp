
(deftemplate person
    (slot id_card (type STRING))
    (slot name (type STRING)) 
    (slot surname (type STRING))
    (slot location)
    (slot cellphone (type STRING))
)

(deftemplate location    
    (slot name (type STRING)) 
    (slot description (type STRING))
    (slot telephone (type STRING))
)

(deffacts main_facts
    ; ********************************
    ; PEOPLE
    ; ********************************
    (person
        (id_card "42888777R")
        (name "Juan") 
        (surname "Pérez")
        (cellphone "619123456")
        (location "Sala de Juntas")
    )
    (person
        (id_card "44555666L")
        (name "Laura") 
        (surname "Martínez")
        (cellphone "616778899")
        (location "Sala de Juntas")
    )

    (person
        (id_card "43999000L")
        (name "Antonio") 
        (surname "Hernández")
        (location "Administración")
    )

    (person
        (id_card "45333444K")
        (name "Luis") 
        (surname "Sosa")        
    )

    ; ********************************
    ; PLACES
    ; ********************************
    (location
        (name "Sala de Juntas")
        (telephone "928458899")
    )

    (location
        (name "Administración")
        (telephone "928111222")
    )

    (location
        (name "Almacén")
        (telephone "928000888")
    )

    ; ********************************
    ; CONDITIONS
    ; ********************************
    (temperature 28)
    (raining no)

)


; ********* CALLING A PERSON *********

(defrule call_person_cellphone
    (declare (salience 10))
    ?i <- (person_to_call ?n ?s)
    (person (name ?n) (surname ?s) (cellphone ?t))
    (test (neq ?t ""))
    =>
    (printout t "El número de móvil de " ?n " " ?s " es " ?t crlf)
    (retract ?i)
)


(defrule call_person_telephone_location
    (declare (salience 5))
    (person_to_call ?n ?s)
    (person (name ?n) (surname ?s) (location ?l))
    (location (name ?l) (telephone ?tloc) )
    =>
    (printout t ?n " " ?s "está en: " ?l ". El teléfono es " ?tloc crlf)
)


; ********* TURNING LIGHTS ON/OFF *********

(defrule turn_light_on
    (location (name ?l))
    (exists (person (location ?l)))
    =>
    (printout t "Encender la luz de: " ?l crlf)
)

(defrule turn_light_off
    (location (name ?l))
    (not (exists (person (location ?l))))
    =>
    (printout t "Apagar la luz de: " ?l crlf)
)

; ********* CONDITIONS *********

(defrule air-conditioning-on
    (location (name ?l))
    (temperature ?t)
    (test (> ?t 25))
    =>
    (bind ?counter 0)
    (do-for-all-facts ((?p person)) ; Loop
        (eq ?p:location ?l) ; Condition
        (bind ?counter (+ ?counter 1)) ; Action
    )
    (if (>= ?counter 2)
        then
        (printout t "Encender aire acondicionado de: " ?l crlf)
    )
)

