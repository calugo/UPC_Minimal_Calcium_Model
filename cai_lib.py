try:
    import numpy as np  
    from numba import jit
    import os, sys


except ImportError as e:
    sys.stderr.write("Error loading module: %s\n"%str(e))
    sys.exit()

@jit(nopython = True)
def Ical(t,T,Io):
    pi = np.pi;
    w = 2*pi/T  
    wo = 2*pi*10/T 
    U = np.sin(w*t)
    if U>0.0 and ((w*t)%pi) <= wo:
        return Io
    else:
        return 0.0

@jit(nopython = True)
def Kn(t,x,pt):

    xn = np.zeros(2)
    
    xn[0] = Ical(t,pt[8],pt[9]) + pt[0]*x[1]*(pt[1]*x[0]**2)/(pt[2]+pt[1]*x[0]**2)*(pt[3]-x[0]) - (x[0]-pt[4])/pt[5]
    xn[1] = pt[6]*(1-x[1]) - pt[7]*x[0]*x[1]
    
    return xn


@jit(nopython = True)
def protocolsx(t):
    
    N = 1e4;
    
    Qn = np.floor(t/N)

    Ts = 300-50*Qn 
    
    print(Ts)

    return Ts 

@jit(nopython = True)
def protoki(t):

    N = 1e4
    Qn = np.floor(t/N)
    kn = 0.002 + 0.0002*Qn
    #kn = 0.0002 + 0.0006*Qn

    return kn