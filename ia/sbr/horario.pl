%
%       GENERADOR DE HORARIOS DE CLASE
%

asignatura(mat).
asignatura(len).
asignatura(nat).
asignatura(bio).


diferente(A,B,C,D) :-
    dif(A,B),
    dif(A,C),
    dif(A,D),
    dif(B,C),
    dif(B,D),
    dif(C,D).

horario(L1,L2,L3,L4, M1,M2,M3,M4, X1,X2,X3,X4) :-
    % LUNES
    asignatura(L1), dif(L1,mat), % Los lunes a primera no puede haber matemáticas.
    asignatura(L2),
    asignatura(L3),
    asignatura(L4),
    diferente(L1,L2,L3,L4), % No puede repetirse una asignatura el mismo día.
    (L3 == nat; L4 == nat), % Naturales debe darse los lunes a tercera o cuarta hora.
    % MARTES
    asignatura(M1),
    asignatura(M2),
    asignatura(M3),
    asignatura(M4),
    diferente(M1,M2,M3,M4),
    % MIÉRCOLES
    asignatura(X1),
    asignatura(X2),
    asignatura(X3),
    asignatura(X4),
    diferente(X1,X2,X3,X4).


go(L1,L2,L3,L4,M1,M2,M3,M4,X1,X2,X3,X4) :-
    horario(L1,L2,L3,L4,M1,M2,M3,M4,X1,X2,X3,X4),
    writeln(" L   M   X"),
    writeln("-----------"),
    write(L1),
    write(" "),
    write(M1),
    write(" "),
    writeln(X1),
    
    write(L2),
    write(" "),
    write(M2),
    write(" "),
    writeln(X2),
    
    write(L3),
    write(" "),
    write(M3),
    write(" "),
    write(X3),
    writeln(" "),

    write(L4),
    write(" "),
    write(M4),
    write(" "),
    write(X4),
    writeln(" "),
    writeln(" ").

% Añadiremos las asignaturas de música (mus) e inglés (ing).
% Añadiremos también el jueves.
% A primera hora nunca puede haber ni matemáticas ni lengua.
% Los jueves siempre debe haber una hora de música.
% Matemáticas y lengua no debe coincidir el mismo día. Podemos utilizar el operador \+ para negar una condición.






