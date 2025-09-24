#!/usr/bin/env python3
from cai_lib import *


def main(args):

    pars=np.zeros(10)
     
    #grel (1/ms), ka (1/[muM^2 ms]), kom (ms^-1), csr = muM 
    pars[0] = 0.556 ; pars[1] = 12; pars[2] = 0.12; pars[3] = 500/1e3;    
    #co, tdiff, kim, ki
    pars[4] = 0.1/1e3 ; pars[5] = 2; pars[6] = 0.002 ; pars[7] = 0.5; 
    #T, Io
    pars[8] = 500;
    pars[9] = 5/1e3;  

    M=100;

    if len(args)==4:
        pars[8] = float(args[1]);
        pars[6] = 1.0/float(args[2]);
        M=float(args[3]);
        
    dt = 1e-1; dtp = 1;
    tf = M*pars[8];
    N = int(tf/dtp);
    Kj = []

    t = 0.0 
    tp = dtp;

    x = np.zeros(2);
    n = 0
    sol = np.zeros((N,3))
    Icaln = np.zeros(N)
    sol[n,1:3] = x
    Icaln[n] = Ical(0,pars[8],pars[9])


    while t<tf:

        #Uncomment to use the protokit or protocolsx functions
        #pars[6] = protoki(t) 
        #pars[8] = protocolsxz(t) 
        #if pars[6] not in Kj:
        #    Kj.append(pars[6])
        #    print(pars[6])

        K1 = Kn(t,x,pars)
        K2 = Kn(t+0.5*dt,x+0.5*dt*K1,pars)
        K3 = Kn(t+0.5*dt,x+dt*0.5*K2,pars)
        K4 = Kn(t+dt,x+dt*K3,pars)

        x = x + (dt/6.0)*(K1+2.0*K2+2.0*K3+K4)
        Ij = Ical(t,pars[8],pars[9]) 
        t = t+dt
        
        if t > tp:
            n+=1
            Icaln[n] = Ij
            sol[n,0] = t
            sol[n,1:3]=x
            tp+=dtp

        if n == N-1:
            np.save('KCa.npy',sol)
            np.save('KIcal.npy',Icaln)
            #np.save('Kj.npy',np.asarray(Kj))
            break

if __name__ == "__main__":
    main(sys.argv[:])