#include<iostream>
#include<cmath>
using namespace std;

const double grel = 0.556;
const double ka = 12;
const double kom =  0.12;
const double csr =  500/1e3;
const double co =  0.1/1e3;
const double tdiff = 2.0;
//const double kim = 0.002;
const double ki =  0.5;

double cn, qn, Io;

extern "C" {

//////////////////////////////////
double I_s(double t, double T){

    double a = t - floor(t/T)*T;
    double I = 0.0;

    if ((a < 10.0) && ((t-a)>=0.0) ){I = 0.005;} 
    
    return I;
}
////////////////////////////////////
double c_i(double c, double q, double It){

    double ct;

    ct = It + grel*ka*pow(c,2.0)*q* ( (csr - c)/ ( kom+ka*pow(c,2.0 ) )) - (c-co)/tdiff;

    return ct;
}
//////////////////////////////////
double c_r(double c, double q, double Tr){

    double cr, kim; 
    
    kim = 1.0/Tr;
    cr = kim *(1-q) - ki *c*q;

    return cr;
}
//////////////////////////////////
double rk(double x, double y, double t, double Ts, double Tr, double *arr, int length){

    double dt = 0.1;
    double K1[2]; double K2[2]; double K3[2]; 
    double K4[2]; double In;
    
    cn = x; 
    qn = y;
    In = I_s(t,Ts);

        
    K1[0] = c_i(cn,qn,I_s(t,Ts));
    K1[1] = c_r(cn,qn,Tr);

    K2[0] = c_i(cn+0.5*dt*K1[0],qn+0.5*dt*K1[1],I_s(t+0.5*dt,Ts));
    K2[1] = c_r(cn+0.5*dt*K1[0],qn+0.5*dt*K1[1],Tr);

    K3[0] = c_i(cn+0.5*dt*K2[0],qn+0.5*dt*K2[1],I_s(t+0.5*dt,Ts));
    K3[1] = c_r(cn+0.5*dt*K2[0],qn+0.5*dt*K3[1],Tr);

    K4[0] = c_i(cn+dt*K3[0],qn+dt*K3[1],I_s(t+dt,Ts));
    K4[1] = c_r(cn+dt*K3[0],qn+dt*K3[1],Tr);

    cn += (dt/6.0)*(K1[0]+2.0*K2[0]+2.0*K3[0]+K4[0]);
    qn += (dt/6.0)*(K1[1]+2.0*K2[1]+2.0*K3[1]+K4[1]);

    arr[0] = t;
    arr[1] = In;
    arr[2] = cn;
    arr[3] = qn;

    return 0;
    
    }
}