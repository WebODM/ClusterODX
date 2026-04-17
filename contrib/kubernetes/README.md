# Kubernetes Deployment
The following provides a means to run ClusterODX on your master node and a series of NodeODX instances on worker nodes in a kubernetes cluster.
The configuration uses GPU's if they are setup on your kubernetes cluster.

## Preparation
Before deploying it is important to make the following changes In the file k8clusternodeodx.yml

change EXTERNALIPADDRESS to the external ip adddress of your k8 cluster
change the number of replicas (REPNUM) for nodeodx to the number of nodes in your cluster (I suggest 1 nodeodx per cluster node)

## Deploy into the k8 cluster
On the  master/head node run the command:

kubectl apply -f k8clusternodeodx.yml

This will then start up 2 deployments
- Deployment 1 with ClusterODX
- Deployment 2 with N replicas of NodeODX.

## Post Deployment Configuration
Once the pods are running you should be able to connect to ClusterODX on http://EXTERNALIPADDRESS:10000 and then add the NodeODX nodes.

### Adding NodeODX nodes to ClusterODX
On the master/head node issue the command: 

kubectl get pods -o wide 

This will supply you with the IP Address details that you need to enter into the ClsuterODM configuration page or add via telnet session.

The following shows the type of output you should get and the IP address details
NAME                                                       READY   STATUS    RESTARTS      AGE     IP              NODE          NOMINATED NODE   READINESS GATES
nodeodx-deployment-6d454b88d5-2z5rh                        1/1     Running   0             157m    172.29.8.86     gigganode02   <none>           <none>
nodeodx-deployment-6d454b88d5-5cksx                        1/1     Running   0             148m    172.29.26.145   gigganode03   <none>           <none>
nodeodx-deployment-6d454b88d5-78wd2                        1/1     Running   0             157m    172.29.6.183    gigganode01   <none>           <none>
nodeodx-deployment-6d454b88d5-7m8pm                        1/1     Running   0             148m    172.29.26.130   gigganode03   <none>           <none>
nodeodx-deployment-6d454b88d5-bfgps                        1/1     Running   0             148m    172.29.26.153   gigganode03   <none>           <none>

### WebODM Configuration
Add the ClusterODX as a Processing Node using the details
EXTERNALIPADDRESS:3000
