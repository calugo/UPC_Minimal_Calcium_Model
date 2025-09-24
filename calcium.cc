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


double I_s(double t, double T);
double  c_i (double c, double q, double It);
double  c_r (double c, double q, double kim);

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

    ct = It + grel*(ka*pow(c,2.0))*q*( (csr - c)/ ( kom+ka*pow(c,2.0 ) )) - (c-co)/tdiff;
    //ct = It + (grel*q)*(c*c)  ( (csr - c)/ ( kom+ka*pow(c,2.0 ) )) - (c-co)/tdiff;

    return ct;
}
//////////////////////////////////
double c_r(double c, double q, double kim){

    double cr; 
    
    cr = kim *(1-q) - ki *c*q;

    return cr;
}
//////////////////////////////////

int main(int argc, char** argv){

    double Ts = atof(argv[1]); //Ts
    double Tr = atof(argv[2]); //Tr
    double tf = atof(argv[3])*Ts; //Tf
    double dt = 0.1;
    double dtp = 1;
    double tp = dtp;
    int N = int(tf/dt);
    double It;
    
    double I[N];
    double C[N];
    double Q[N];
    double T[N];

    double t = 0;
    int i = 0;

    double K1[2]; double K2[2]; double K3[2]; 
    double K4[2];
    double kim;

    cn = 0.0; 
    qn = 0.0;
    Io = I_s(0.0,Ts);
    kim = 1.0/Tr ;

    cout << t << "," << cn <<","<< qn <<"," << Io <<"\n";

    while(t<tf){
        
        K1[0] = c_i(cn,qn,I_s(t,Ts));
        K1[1] = c_r(cn,qn,kim);

        K2[0] = c_i(cn+0.5*dt*K1[0],qn+0.5*dt*K1[1],I_s(t+0.5*dt,Ts));
        K2[1] = c_r(cn+0.5*dt*K1[0],qn+0.5*dt*K1[1],kim);

        K3[0] = c_i(cn+0.5*dt*K2[0],qn+0.5*dt*K2[1],I_s(t+0.5*dt,Ts));
        K3[1] = c_r(cn+0.5*dt*K2[0],qn+0.5*dt*K3[1],kim);

        K4[0] = c_i(cn+dt*K3[0],qn+dt*K3[1],I_s(t+dt,Ts));
        K4[1] = c_r(cn+dt*K3[0],qn+dt*K3[1],kim);

        cn += (dt/6.0)*(K1[0]+2.0*K2[0]+2.0*K3[0]+K4[0]);
        qn += (dt/6.0)*(K1[1]+2.0*K2[1]+2.0*K3[1]+K4[1]);
        It = I_s(t,Ts);
        t+=dt;

        if (t>tp){    
            cout << t << "," << cn <<","<<qn<< ","<<It<<"\n";
            tp+=dtp;
        }
    }
}