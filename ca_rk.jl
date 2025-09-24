#!/usr/bin/env julia

using CSV, DataFrames

#Stimulus
function Isx(t,p)
    
    Iₒ,T = p
    I = 0.0
    a = t - T*floor(t/T)
    b = 10.0

    ( (a <= b) && ((t-a)>=0.0)) ? I=Iₒ : I=0.0 
    
    return I
end 

#ODE functions 
function dcai(p,u)
    grel, ka, kom, csr, co, tdiff, kim, ki, Io, To = p
    t,c,q = u
    Ic = Isx(t,[Io,To])
    dc = Ic + grel*q*(ka*c^2)*(csr - c)/(kom+ka*c^2) - (c - co)/tdiff
    dq = kim*(1-q)-ki*c*q
    
    return [dc,dq]
    
end

function main()
    Ts = parse(Float64,ARGS[1]); Tr = parse(Float64,ARGS[2]); N = parse(Float64,ARGS[3]);
    
    ki = 1.0/Tr;
    uₒ=[0.0,0.0] #solution array
    pₒ=[0.556,12,0.12,500/1e3,0.1/1e3,2.0,ki,0.5,5.0/1000,Ts] #Parameters
    dt = 0.1 #Time Step


    t = 0.0:dt:N*Ts
    u = uₒ
    p = pₒ 

    T = zero(t) 
    ca= zero(t) 
    qa = zero(t)
    it =zero(t)

    #RK4
    for (i,τ) in enumerate(t)
        x = [τ,u[1],u[2]]
        k1 = dcai(p,x) 
        k2 = dcai(p,[τ+dt*0.5,x[2]+0.5*dt*k1[1],x[3]+0.5*dt*k1[2]])
        k3 = dcai(p,[τ+dt*0.5,x[2]+0.5*dt*k2[1],x[3]+0.5*dt*k2[2]])
        k4 = dcai(p,[τ+dt,x[2]+dt*k3[1],x[3]+dt*k3[2]])
        u +=  (dt/6.0)*(k1+2.0*k2+2.0*k3+k4)
        ca[i] = u[1]
        qa[i] = u[2]
        it[i] = Isx(τ,[5.0/1000,Ts])
        T[i] = τ
    end

    #Write the results to a file.
    results = [T,ca,qa,it]
    fn = "Ca_Results.csv"
    CSV.write(fn,DataFrame(results, :auto), writeheader=false)
end

main()
