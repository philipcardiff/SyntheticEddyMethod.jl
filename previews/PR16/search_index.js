var documenterSearchIndex = {"docs":
[{"location":"advanced_usage/#Advanced-usage","page":"Advanced Usage","title":"Advanced usage","text":"","category":"section"},{"location":"advanced_usage/","page":"Advanced Usage","title":"Advanced Usage","text":"In this page are provided some example on how the user can customize the eddy generation.","category":"page"},{"location":"advanced_usage/","page":"Advanced Usage","title":"Advanced Usage","text":"Defining the Virtual Box in y and z directions.","category":"page"},{"location":"advanced_usage/","page":"Advanced Usage","title":"Advanced Usage","text":"using SyntheticEddyMethod\n\nσ = 0.1\nb = 2.0\na = 0.0\n\ny = collect(a:0.1:b)\nz = collect(a:0.1:b)","category":"page"},{"location":"advanced_usage/","page":"Advanced Usage","title":"Advanced Usage","text":"It is possible also to specify the x direction dimensions, a different shape funcion and different σ in the three different directions. The shape coded can be seen in the Shapefunctions.jl file.","category":"page"},{"location":"advanced_usage/","page":"Advanced Usage","title":"Advanced Usage","text":"x = collect(-1:0.1:1)\nσx = 0.1\nσy = 0.05\nσz = 0.07\nσ = [σx,σy,σz]\nVboxinfo = VirtualBox(x,y,z,σ; shape_fun = step_fun)\nN = Vboxinfo.N\nEddies = initialize_eddies(Vboxinfo)\n","category":"page"},{"location":"advanced_usage/#Define-custom-Reynolds-Stress-Tensor","page":"Advanced Usage","title":"Define custom Reynolds Stress Tensor","text":"","category":"section"},{"location":"advanced_usage/","page":"Advanced Usage","title":"Advanced Usage","text":"The user can also use a custom Reynolds stress just by writing a 3x3 matrix.","category":"page"},{"location":"advanced_usage/","page":"Advanced Usage","title":"Advanced Usage","text":"Re = [1.87e-5 -8.6e-8  -8.2e-7; -8.6e-8 5.27e-8 6.8e-8; -8.2e-7 4.9e-9 2.64e-6]","category":"page"},{"location":"advanced_usage/#Import-the-Reynolds-Stress-Tensor-from-file","page":"Advanced Usage","title":"Import the Reynolds Stress Tensor from file","text":"","category":"section"},{"location":"advanced_usage/","page":"Advanced Usage","title":"Advanced Usage","text":"Or use a database where the the Reynolds Stress is defined pointwise. ","category":"page"},{"location":"advanced_usage/","page":"Advanced Usage","title":"Advanced Usage","text":"using XLSX\nreynolds_stress_file = joinpath(@__DIR__,\"..\",\"..\",\"test\",\"Data\",\"Re_ch.xlsx\")\nA_from_file = get_reynolds_stress_from_file(reynolds_stress_file)","category":"page"},{"location":"advanced_usage/","page":"Advanced Usage","title":"Advanced Usage","text":"An curious user notice that in this last case the Reynolds Stress is not a matrix, but it is an interpolator object. It depends on the point location where the user want to compute the fluctuations.","category":"page"},{"location":"advanced_usage/","page":"Advanced Usage","title":"Advanced Usage","text":"vector_points = [0.0, 1.0, 2.5]\ndt = 0.01\nU₀ = 1.0\ncompute_fluct(vector_points, dt, Eddies, U₀, Vboxinfo,Re )","category":"page"},{"location":"advanced_usage/#Analyze-the-signal","page":"Advanced Usage","title":"Analyze the signal","text":"","category":"section"},{"location":"advanced_usage/","page":"Advanced Usage","title":"Advanced Usage","text":"A simple case is used.","category":"page"},{"location":"advanced_usage/","page":"Advanced Usage","title":"Advanced Usage","text":"using SyntheticEddyMethod\nusing Statistics\n\nσ = 0.1 #eddy dimensions, the same in all the directions\nb = 5.0\na = 0.0\n\n\n#Defining the Virtual Box domain\nx = -σ:0.1:+σ \ny = collect(a:0.1:b)\nz = collect(a:0.1:b)\n\n\nVboxinfo = VirtualBox(y,z,σ)\nN = Vboxinfo.N\ndt = 0.01\n\nU₀ = 1.0 #Convective Velocity\nTI = 0.01 #turbulence intensity\n\nRe_stress, Eddies = initialize_eddies(U₀, TI, Vboxinfo)\n\n\n#Computing the velocity in the middle of the VirtualBox domain\nvector_points = [0.0, b/2, b/2]\n\n#Defining how many time interval\nNt = 1000\nU = zeros(Nt, 3)\n\ntime_vec = collect(0:dt:dt*(Nt-1))\nfor i = 1:1:Nt\n    U[i,:] = compute_fluct(vector_points, time_vec[i], Eddies, U₀, Vboxinfo, Re_stress)\nend\n\n#The deviation standard should approach the turbulence intensity\n#This is what is done during testing\nUstd_1 = Statistics.std(U[:,1])\nUstd_2 = Statistics.std(U[:,2])\nUstd_3 = Statistics.std(U[:,3])\nmean([Ustd_1, Ustd_2, Ustd_3])\n","category":"page"},{"location":"advanced_usage/#Spectral-Analysis","page":"Advanced Usage","title":"Spectral Analysis","text":"","category":"section"},{"location":"advanced_usage/","page":"Advanced Usage","title":"Advanced Usage","text":"using SyntheticEddyMethod\nusing DataFrames, XLSX, Plots\n#Turbulence intensity to test\nTI_vec = 0.01:0.01:0.05\n\nk = 0.1:1000\nE = (k).^(-5/3)*0.01 #multiplied by 100 for shifting the curve in the top part\n\nN_restart = 20\nNt = 2000\ntime_vec = collect(0:dt:dt*(Nt-1))\n\ndt = 0.001\n\n#It can take up to 20 minutes\nfor TI in TI_vec\n\n    PSD = 0.0\n    freqs = 0.0   \n\n    for i=1:1:N_restart\n        Vboxinfo = VirtualBox(y,z,σ)\n        Re_stress, Eddies = initialize_eddies(U₀, TI, Vboxinfo)\n         q = Vector{Float64}[]\n        for j = 1:1:Nt\n            qi = compute_fluct(vector_points, time_vec[j], Eddies, U₀, Vboxinfo, Re_stress)\n            push!(q,qi)\n        end\n        println(i)\n\n        Ek =  compute_Ek(q, U₀)\n        PSD_tmp, freqs = fft_from_signal(Ek, dt)\n        PSD = PSD .+ PSD_tmp ./N_restart\n    end\n\n        PSD_data = DataFrame([PSD, freqs], [:PSD, :freqs])\n        XLSX.writetable(\"test/psd_results_$TI.xlsx\", \"$TI\" => PSD_data)\nend\n\n#Random Signal\nN_rand = 1000\nPSD_rand_tot = 0.0\nfreqs_rand = 0.0\nfor i = 1:1:N_rand\n    rand_signal = randn(3000).*(TI)\n    PSD_rand, freqs_rand = fft_from_signal(3/2 .* rand_signal.^2 ,dt)\n    PSD_rand_tot = PSD_rand_tot .+ 1/N_rand .*PSD_rand\nend\n\n\n\n\nPSD_data = DataFrame[]\n\nfor i = eachindex(TI_vec)\n    TI = TI_vec[i]\n    filename = \"test/psd_results_$TI.xlsx\"\n    df_tmp = DataFrame(XLSX.readtable(filename, \"$TI\"))\n    push!(PSD_data, df_tmp)\nend\n\nPlots.plot(xaxis=:log, yaxis=:log, xlim = [0.5, 1e3], ylims =[1e-10, 1], xlabel=\"k\", ylabel=\"E(k)\", legend=:bottomleft, xticks=[1,10,100,1000])\nfor i = eachindex(TI_vec)\n    TI = TI_vec[i]\n    Plots.plot!(PSD_data[i].freqs, PSD_data[i].PSD, label = \"SEM - TI = $TI\")\n\nend\n\nplot!(freqs_rand, PSD_rand_tot, label = \"RAND\")\nplot!(k, E, linestyle=:dash, label = \"E(k)∝k^-5/3\")\n\n","category":"page"},{"location":"usage/#Package-usage","page":"Usage","title":"Package usage","text":"","category":"section"},{"location":"usage/#Using-the-SEM","page":"Usage","title":"Using the SEM","text":"","category":"section"},{"location":"usage/","page":"Usage","title":"Usage","text":"At first, the user defines the dimension and resolution of the virtual box where the eddies are going to be generated as well as the dimension of the eddies (σ). A common choice is σ = 2Δz or σ = Δz, where Δz is the mesh resolution in the z direction.","category":"page"},{"location":"usage/","page":"Usage","title":"Usage","text":"using SyntheticEddyMethod\nσ = 0.1\nb = 5.0\na = 0.0\ny = collect(a:0.1:b)\nz = collect(a:0.1:b)","category":"page"},{"location":"usage/","page":"Usage","title":"Usage","text":"Notice: only the first and last value of ´y´ and ´z´ are used to create the VirtualBox.","category":"page"},{"location":"usage/","page":"Usage","title":"Usage","text":"Then you create the VirtualBox structure that has embedded all the information about the virtual box where the eddy are generated. The number of eddy is automatically computed in order to guarantee an homogeneous fill. You can manually override the value (Vboxinfo.N).","category":"page"},{"location":"usage/","page":"Usage","title":"Usage","text":"Vboxinfo = VirtualBox(y,z,σ)\nN = Vboxinfo.N #you can override it ","category":"page"},{"location":"usage/","page":"Usage","title":"Usage","text":"Then, eddies are initialize in the virtualbox with random values of position and intensity. You have to specify the time-step, dt. The Reynolds stress tensor can be specified by the user (as a 3x3 matrix) or automatically computed just providing the turbulence intensity and convective velocity.","category":"page"},{"location":"usage/","page":"Usage","title":"Usage","text":"Eddies = initialize_eddies(Vboxinfo)\nt = 0\ndt = 0.001\nU₀ = 1.0 #Convective velocity, x-axis\nTI = 0.01 #turbulence intensity\n\nRe_stress, Eddies = initialize_eddies(U₀, TI, Vboxinfo)\n","category":"page"},{"location":"usage/","page":"Usage","title":"Usage","text":"You have to create a Vector{Vector{Float64}} of points where you want to evaluate the speed.","category":"page"},{"location":"usage/","page":"Usage","title":"Usage","text":"x = 0.0\nvector_points = create_vector_points(x, y, z)\n","category":"page"},{"location":"usage/","page":"Usage","title":"Usage","text":"u_fluct = compute_fluct(vector_points, dt, Eddies, U₀, Vboxinfo, Re_stress)","category":"page"},{"location":"usage/","page":"Usage","title":"Usage","text":"You can create evaluate the speed in just one point (useful for monitoring how the velocity varies in time and creating the spectra)","category":"page"},{"location":"usage/","page":"Usage","title":"Usage","text":"single_point = [0.0, 1.0, 2.5]\nu_fluct = compute_fluct(single_point, dt, Eddies, U₀, Vboxinfo, Re_stress)\n","category":"page"},{"location":"usage/","page":"Usage","title":"Usage","text":"Compute the velocity fluctuation and then is 'corrected' using the Reynolds Stress tensor.","category":"page"},{"location":"usage/","page":"Usage","title":"Usage","text":"Compute the turbulent kinetic energy:","category":"page"},{"location":"usage/","page":"Usage","title":"Usage","text":"    Ek  = compute_Ek(u_fluct, U₀)","category":"page"},{"location":"usage/#Using-the-DFSEM","page":"Usage","title":"Using the DFSEM","text":"","category":"section"},{"location":"usage/","page":"Usage","title":"Usage","text":"Following an analogus procedure is possible to use the divergence-free sythetic eddy method. It allows to create fluctuations that are divergence-free, useful for incompressible flows. The virtual box is created in an analogus way. Internally the shape function in this case is DFSEM_fun which has been specifically designed for the DFSEM.","category":"page"},{"location":"usage/","page":"Usage","title":"Usage","text":"using SyntheticEddyMethod\nusing LinearAlgebra\nσ = 0.1\nb = 5.0\na = 0.0\ny = collect(a:0.1:b)\nz = collect(a:0.1:b)\n\nVboxinfo = VirtualBox(y,z,σ)\ndt = 0.001\nU₀ = 1.0\nTI = 0.01 #turbulence intensity\n\nRe_stress, Eddies = initialize_eddies(U₀, TI, Vboxinfo)\n","category":"page"},{"location":"usage/","page":"Usage","title":"Usage","text":"Now, we are going to evaluate the fluctutations in 4 points useful for approximating the divergence:\nxyz x+dx y z xy+dyz xyz+dz","category":"page"},{"location":"usage/","page":"Usage","title":"Usage","text":"dl = 0.0001\nvector_points = [[0.0, b / 2, b / 2], [dl, b / 2, b / 2], [0.0, b / 2 + dl, b / 2], [0.0, b / 2, b / 2 + dl]]\nu_fluct = compute_fluct(vector_points, dt, Eddies, U₀, Vboxinfo, Re_stress; DFSEM = true)","category":"page"},{"location":"usage/","page":"Usage","title":"Usage","text":"In order to verify the diverge-free condition is respected, the derivatives in each direction are computed with a simple forward method. The divergence is normalized with the module of the gradient to obtain a non-diemensional quantity.\ndfracnablacdot vecunabla vecu","category":"page"},{"location":"usage/","page":"Usage","title":"Usage","text":"dudx = (u_fluct[2][1] - u_fluct[1][1]) / dl\ndvdy = (u_fluct[3][2] - u_fluct[1][2]) / dl\ndwdz = (u_fluct[4][3] - u_fluct[1][3]) / dl\ngrad_norm = norm([dudx, dvdy, dwdz])\ndiv_val = dudx + dvdy + dwdz\n\ndiv_val/grad_norm","category":"page"},{"location":"usage/","page":"Usage","title":"Usage","text":"Note: if nabla vecu is too small, it can leads NaN values.","category":"page"},{"location":"exploring/#Exploring-the-package","page":"Exploring","title":"Exploring the package","text":"","category":"section"},{"location":"exploring/#Visualize-the-centre-of-the-eddies","page":"Exploring","title":"Visualize the centre of the eddies","text":"","category":"section"},{"location":"exploring/","page":"Exploring","title":"Exploring","text":"Notice that the default value of the number of eddies is overwritten to reduce the total number in order to make the visualization clearer","category":"page"},{"location":"exploring/","page":"Exploring","title":"Exploring","text":"using SyntheticEddyMethod\nusing Plots\nσ = 0.1\nb = 5.0\na = 0.0\nx = collect(-0.1:0.1:0.1)\ny = collect(a:0.1:b)\nz = collect(a:0.1:b)\n\n\nVboxinfo = VirtualBox(x, y, z, σ)\nVboxinfo.N = 100\ndt = 0.01\n\nU₀ = 1.0 #Convective Velocity\nTI = 0.2 #turbulence intensity\nRe, Eddies = initialize_eddies(U₀, TI, Vboxinfo)\n\nPlots.scatter()\nfor i = 1:1:length(Eddies)\nPlots.scatter!([Eddies[i].xᵢ[1]], [Eddies[i].xᵢ[2]], \n[Eddies[i].xᵢ[3]],   legend=false,  ms=2, color=:black)\n\nend\nPlots.scatter!(xlabel=\"x\",ylabel=\"y\",zlabel=\"z\")","category":"page"},{"location":"exploring/#Visualize-isosurface-velocity","page":"Exploring","title":"Visualize isosurface velocity","text":"","category":"section"},{"location":"exploring/","page":"Exploring","title":"Exploring","text":"using PlotlyJS\n\ndt = 0.01\nX, Y, Z = mgrid(x, y, z)\nvector_points = create_vector_points(x, y, z)\nVboxinfo = VirtualBox(x, y, z, σ)\nRe, Eddies = initialize_eddies(U₀, TI, Vboxinfo)\n\nVboxinfo.N\n\nvalue = map(x-> compute_uSEM(x, Eddies, Vboxinfo, Re)[1], vector_points)\n\nA = value[1]'\nfor i = 1:1:length(value)\nA = vcat(A,value[i]')\nend\n\niso_surfaces = isosurface(\n    x=X[:],\n    y=Y[:],\n    z=Z[:],\n    value=A[:,1],\n    isomin=0.1,\n    isomax=1,\n    surface_count=3,\n    opacity=0.5,\n    caps=attr(x_show=false, y_show=false)\n)\n\nlayout=Layout(yaxis=attr(scaleanchor=\"x\", scaleratio=1), zaxis=attr(scaleanchor=\"x\", scaleratio=1))\nio = PlotlyJS.plot(iso_surfaces, Layout(yaxis=attr(scaleanchor=\"x\", scaleratio=1)))\n","category":"page"},{"location":"exploring/#Visualize-the-Divergence-Free-Plane","page":"Exploring","title":"Visualize the Divergence Free Plane","text":"","category":"section"},{"location":"exploring/","page":"Exploring","title":"Exploring","text":"using SyntheticEddyMethod\nusing Statistics\nusing LinearAlgebra\nusing Plots\nσ = 0.05\nb = 1.0\na = 0.0\ny = collect(a:0.1:b)\nz = collect(a:0.1:b)\n\n\nVboxinfo = VirtualBox(y, z, σ)\n\ndt = 0.01\nU₀ = 1.0 #Convective Velocity\nTI = 0.1 #turbulence intensity\nRe, Eddies = initialize_eddies(U₀, TI, Vboxinfo)\n\n#Creating vector of points (0, yp, zp)\nval = create_vector_points(0.0,y,z)\ndl = 0.0001\n\n#Creating vector of points (dl, yp, zp), (0, yp+dl, zp), (0, yp, zp+dl)\n#for computing the divergence \nux = create_vector_points(dl,y,z)\nuy = create_vector_points(0.0, y .+dl,z)\nuz = create_vector_points(0.0, y ,z .+ dl)\n\n\nD = Vector{Float64}[]\nfor (u,ux,uy,uz) in zip(val, ux,uy,uz)\npush!(D,u)\npush!(D,ux)\npush!(D,uy)\npush!(D,uz)\nend\n\n\nr = compute_fluct(D, dt, Eddies, U₀, Vboxinfo::VirtualBox, Re; DFSEM=true)\n\ngD = Float64[]\n\n\nfor i = 1:4:length(D)\ndudx = (r[i+1][1] - r[i][1]) / dl\n\ndvdy = (r[i+2][2] - r[i][2]) / dl\n\ndwdz = (r[i+3][3] - r[i][3]) / dl\ngrad_norm = norm([dudx, dvdy, dwdz])\n\ndiv_norm =  (dudx + dvdy + dwdz)/norm([dudx, dvdy, dwdz])\n\nif isnan(div_norm)\n    push!(gD, 1e-7)\nelse\n    push!(gD, div_norm)\nend\n\nend\n\n\ngD_mat = reshape(gD, (length(z), length(y)))\n\nusing LaTeXStrings\ntv = -7:-1\ntl = [L\"10^{%$i}\" for i in tv]\n\np1 = contourf(y, y, log10.(abs.(gD_mat)), fill = true, color=:turbo, aspect_ratio=:equal, levels=8)\nplot!(xlabel=\"y\", ylabel=\"z\")","category":"page"},{"location":"ref/#Index","page":"References","title":"Index","text":"","category":"section"},{"location":"ref/#Shape-Functions","page":"References","title":"Shape Functions","text":"","category":"section"},{"location":"ref/","page":"References","title":"References","text":"tent_fun\nstep_fun\ntrunc_gauss_fun\nDFSEM_fun","category":"page"},{"location":"ref/#SyntheticEddyMethod.tent_fun","page":"References","title":"SyntheticEddyMethod.tent_fun","text":"tent_fun(x)\n\nTent-like shape function. The domain of the function is [-1,1]x[-1,1]x[-1,1].\nIt satisfy the normalization condition:\nint_-1^1 fσ^2(x) dx = 1\n\n\n\n\n\n","category":"function"},{"location":"ref/#SyntheticEddyMethod.step_fun","page":"References","title":"SyntheticEddyMethod.step_fun","text":"step_fun(x)\n\nStep function. The domain of the function is [-1,1]x[-1,1]x[-1,1].\nIt satisfy the normalization condition:\nint_-1^1 fσ^2(x) dx = 1\n\n\n\n\n\n","category":"function"},{"location":"ref/#SyntheticEddyMethod.trunc_gauss_fun","page":"References","title":"SyntheticEddyMethod.trunc_gauss_fun","text":"trunc_gauss_fun(x)\n\nTruncated Gaussian function. The domain of the function is [-1,1]x[-1,1]x[-1,1].\nIt satisfy the normalization condition:\nint_-1^1 fσ^2(x) dx = 1\n\n\n\n\n\n","category":"function"},{"location":"ref/#SyntheticEddyMethod.DFSEM_fun","page":"References","title":"SyntheticEddyMethod.DFSEM_fun","text":"DFSEM_fun(rs::Float64)\n\nShape function specifically designed for using DFSEM.\n\n\n\n\n\n\n","category":"function"},{"location":"ref/#Decomposition","page":"References","title":"Decomposition","text":"","category":"section"},{"location":"ref/","page":"References","title":"References","text":"cholesky_decomposition","category":"page"},{"location":"ref/#SyntheticEddyMethod.cholesky_decomposition","page":"References","title":"SyntheticEddyMethod.cholesky_decomposition","text":"cholesky_decomposition(R::Matrix{Float64})\n\nCholesky Decomposition of the Reynolds Stress Tensor.\n\n\n\n\n\n","category":"function"},{"location":"ref/#Reynolds-Stress","page":"References","title":"Reynolds Stress","text":"","category":"section"},{"location":"ref/","page":"References","title":"References","text":" Reynolds_stress_tensor\n get_reynolds_stress_from_file","category":"page"},{"location":"ref/#SyntheticEddyMethod.Reynolds_stress_tensor","page":"References","title":"SyntheticEddyMethod.Reynolds_stress_tensor","text":"Reynolds_stress_tensor\n\nStruct hosting the Reynolds stress tensor informations\n\n\n\n\n\n","category":"type"},{"location":"ref/#SyntheticEddyMethod.get_reynolds_stress_from_file","page":"References","title":"SyntheticEddyMethod.get_reynolds_stress_from_file","text":"get_reynolds_stress_from_file(Re_file_info::String)\n\nFunction called by the user, where the Refileinfo is path of the .xlsx file with the data of the Reynolds Stress.\nFile column example:\n\n| Z | Y | UU | VV | WW | UV | UW | VW |\n\n\n\n\n\n","category":"function"},{"location":"ref/#Eddies","page":"References","title":"Eddies","text":"","category":"section"},{"location":"ref/","page":"References","title":"References","text":" AbstractEddy\n SemEddy\n VirtualBox\n convect_eddy\n initialize_eddies","category":"page"},{"location":"ref/#SyntheticEddyMethod.AbstractEddy","page":"References","title":"SyntheticEddyMethod.AbstractEddy","text":"AbstractEddy\n\nAbstract type defining an Eddy object.\n\n\n\n\n\n","category":"type"},{"location":"ref/#SyntheticEddyMethod.SemEddy","page":"References","title":"SyntheticEddyMethod.SemEddy","text":"SemEddy\n\nIt identify the properties of each eddy.\n\neddy_num::Int64     : Eddy identification number\nσ::Vector{Float64}  : Eddy length scale\nxᵢ::Vector{Float64} : Eddy's position in the computational box [x,y,z]\nϵᵢ::Vector{Float64}  : Eddy's intensity (+1 or -1) in [x,y,z]\n\n\n\n\n\n","category":"type"},{"location":"ref/#SyntheticEddyMethod.VirtualBox","page":"References","title":"SyntheticEddyMethod.VirtualBox","text":"VirtualBox\n\nVirtual Volume box where the eddies are created.\n\nσ::Vector{Float64} : 3 elements vector, to have different σ in different directions\nN::Int64 : number of eddies\nshape_fun::Function : shape function\nV_b::Float64 : volume of the virtual box\nX_start::Float64\nX_end::Float64\nY_start::Float64\nY_end::Float64\nZ_start::Float64\nZ_end::Float64\n\n\n\n\n\n","category":"type"},{"location":"ref/#SyntheticEddyMethod.convect_eddy","page":"References","title":"SyntheticEddyMethod.convect_eddy","text":"convect_eddy(dt::Float64, Eddy::SemEddy, U₀::Float64, σ::Vector{Float64}, Vbinfo::VirtualBox)\n\nThe eddies are convected, shifted in the x direction of a distance dt * U₀.\nIf one eddy exits the Virtual Box, it is re-generated randomly inside the Virtual Box.\n\n\n\n\n\n","category":"function"},{"location":"ref/#SyntheticEddyMethod.initialize_eddies","page":"References","title":"SyntheticEddyMethod.initialize_eddies","text":"initialize_eddies(Vbinfo::VirtualBox)\n\nInitialize Eddy position and intensity\n\n\n\n\n\n","category":"function"},{"location":"ref/#Fluctuations","page":"References","title":"Fluctuations","text":"","category":"section"},{"location":"ref/","page":"References","title":"References","text":" compute_fluct\n compute_uSEM\n compute_uDFSEM","category":"page"},{"location":"ref/#SyntheticEddyMethod.compute_fluct","page":"References","title":"SyntheticEddyMethod.compute_fluct","text":"compute_fluct(vec_points::Vector{Vector{Float64}}, dt::Float64, Eddies::Vector{SemEddy}, U₀::Float64, Vbinfo::VirtualBox, Re::Union{Matrix,Reynolds_stress_interpolator}; DFSEM = false)\n\nCompute the velocity fluctuations accordingly to the Reynolds Stress Re. It can be selected the DFSEM that impose also the divergence free condition.\n\n\n\n\n\n","category":"function"},{"location":"ref/#SyntheticEddyMethod.compute_uSEM","page":"References","title":"SyntheticEddyMethod.compute_uSEM","text":"compute_uSEM(vec_points::Vector{Vector{Float64}}, Eddies::Vector{SemEddy}, Vbinfo::VirtualBox, Re::Union{Matrix,Reynolds_stress_interpolator})\n\nIt computes the velocity fluctuations using the SEM. In order it computes\n\nEach j-eddy is convected of a distance dt⋅U₀ in the x direction\nThe distance between each point and the centre of the eddy x - xⱼ\nIt is normalised using σ for each direction\nqσ using the shape function and taking into account the intensity ϵᵢ in each direction\nReynolds stress and the Cholesky decomposition\ntotal contribution of the j-eddy\n\nAt the end the total contribution is rescaled by a factor B\n\n\n\n\n\n","category":"function"},{"location":"ref/#SyntheticEddyMethod.compute_uDFSEM","page":"References","title":"SyntheticEddyMethod.compute_uDFSEM","text":"compute_uDFSEM(vec_points::Vector{Vector{Float64}}, Eddies::Vector{SemEddy}, Vbinfo::VirtualBox, Re::Union{Matrix,Reynolds_stress_interpolator})\n\nIt computes the velocity fluctuations using the DFSEM. In order it computes\n\nEach j-eddy is convected of a distance dt⋅U₀ in the x direction\nThe distance between each point and the centre of the eddy x - xⱼ\nIt is normalised using σ for each direction, takes the norm\nqσ using the specifically designed shape function\neigenvalues of Reynolds stress in principal axes and its eigenvectors\na rotation from Local (principal axes) to Global coordinates system, based on eigenvectors of Reynolds stress tensor and the eddy intensity ϵᵢ\ntotal contribution of the j-eddy\n\nAt the end the total contribution is rescaled by a factor B\n\n\n\n\n\n","category":"function"},{"location":"ref/#Utilities","page":"References","title":"Utilities","text":"","category":"section"},{"location":"ref/","page":"References","title":"References","text":" create_vector_points\n compute_Ek\n fft_from_signal","category":"page"},{"location":"ref/#SyntheticEddyMethod.create_vector_points","page":"References","title":"SyntheticEddyMethod.create_vector_points","text":"create_vector_points(x, y, z)\n\nCreate a vector of points. Useful for testing purposes.\n\nExamples\n\njulia> create_vector_points([1.0], [2.0, 3.0], [1.5, 3.5, 4.2])\n6-element Vector{Vector{Float64}}:\n [1.0, 2.0, 1.5]\n [1.0, 2.0, 3.5]\n [1.0, 2.0, 4.2]\n [1.0, 3.0, 1.5]\n [1.0, 3.0, 3.5]\n [1.0, 3.0, 4.2]\n\n\n\n\n\n","category":"function"},{"location":"ref/#SyntheticEddyMethod.compute_Ek","page":"References","title":"SyntheticEddyMethod.compute_Ek","text":"compute_Ek(U::Vector{Vector{Float64}}, U₀::Float64)\n\nCompute the turbulent kinetic energy. The convective speed U₀ is subtracted from the x component of the speed.\n\nExamples\n\njulia> compute_Ek([1.2, 0.1, 0.3], 1.0)\n0.06999999999999999\n\n\n\n\n\n","category":"function"},{"location":"ref/#SyntheticEddyMethod.fft_from_signal","page":"References","title":"SyntheticEddyMethod.fft_from_signal","text":"fft_from_signal(q::Vector{Float64},dt::Float64)\n\nIt performs the Fast Fourier transformation of the signal q.\n\nExamples\n\n# We create a random signal\njulia> q = rand(1000)\n1000-element Vector{Float64}:\n 0.7478100061738703\n 0.16303784021483914\n 0.3628099523805166\n 0.2608705413573018\n 0.22498693840252693\n 0.9428769056802648\n 0.3579787963511998\n 0.7224804012744513\n ⋮\n 0.9946122085650284\n 0.9183278219776294\n 0.19908223170935013\n 0.7708756376182156\n 0.5007439030983675\n 0.8464298265686861\n 0.8700496116560734\n 0.3670620181980453\njulia> psd, freq = fft_from_signal(q,0.1)\n([0.11064559574015868, 0.005389219813554343, 0.21634910063286397, 0.12896616563010807, 0.1578838809521174, 0.051975560320304294, 0.10663607461615124, 0.1119872950890813, 0.009687265867758152, 0.1469444321528952  …  0.08051345232908684, 0.1481450312902375, 0.018682727272637666, 0.19356783851443643, 0.006863014095143317, 0.009106381063590546, 0.01426246439106842, 0.25854085870704596, 0.08248723638591579, 0.18281921062421522], [0.01, 0.02, 0.03, 0.04, 0.05, 0.06, 0.07, 0.08, 0.09, 0.1  …  4.9, 4.91, 4.92, 4.93, 4.94, 4.95, 4.96, 4.97, 4.98, 4.99])\njulia> length(psd)\n499\njulia> length(freq)\n499\n\n\n\n\n\n","category":"function"},{"location":"#SyntheticEddyMethod.jl","page":"Introduction","title":"SyntheticEddyMethod.jl","text":"","category":"section"},{"location":"","page":"Introduction","title":"Introduction","text":"Documentation of SyntheticEddyMethod.jl for synthetic eddy generation","category":"page"},{"location":"#Introduction","page":"Introduction","title":"Introduction","text":"","category":"section"},{"location":"","page":"Introduction","title":"Introduction","text":"The Synthetic Eddy Method (SEM) is a numerical simulation technique used to model turbulent fluid flow in engineering and scientific applications. It involves synthesizing small-scale turbulent structures, or eddies, within a computational domain to represent the effects of larger-scale turbulent flows. This is accomplished by applying perturbations to the flow field, which induce a cascade of energy from larger to smaller eddies until the energy is dissipated through viscous effects. The result is a simulation that captures the important features of turbulent flows while remaining computationally efficient. SEM has been successfully applied to a range of problems, including airfoil and wing design, turbulent combustion, and oceanography. Its ability to accurately capture the physics of turbulent flows makes it a valuable tool for researchers and engineers seeking to improve the efficiency and performance of fluid systems.","category":"page"},{"location":"","page":"Introduction","title":"Introduction","text":"The method has been originally developed by Jarrin (10.1016/j.ijheatfluidflow.2006.02.006).","category":"page"},{"location":"","page":"Introduction","title":"Introduction","text":"The Divergence-Free Synthetic Eddy Method (DFSEM) is an evolution of the Synthetic Eddy Method (SEM) used for simulating turbulent flows in fluid dynamics. While the SEM uses stochastic generation of eddies to represent the small scales of turbulence, the DFSEM adds the constraint of ensuring that the synthetic eddies produce a divergence-free flow field. In incompressible flows, as the case of turbulent flows, this constraint ensures that the overall flow remains physically consistent and leads to better accuracy and stability in the simulations.","category":"page"},{"location":"","page":"Introduction","title":"Introduction","text":"The method has been originally developed by Poletto at al. (10.1007/s10494-013-9488-2).","category":"page"},{"location":"#Package-Features","page":"Introduction","title":"Package Features","text":"","category":"section"},{"location":"","page":"Introduction","title":"Introduction","text":"Create fluctuations that respect the divergence-free condition (DFSEM)\nCreate velocity fluctuations for inlet boundary conditions\nCreate coeherent eddies in 3D domain\nDefine custom Reynolds Stress Tensor\nImport from file custom Reynolds Stress Tensor","category":"page"},{"location":"#Acknowledgement","page":"Introduction","title":"Acknowledgement","text":"","category":"section"},{"location":"","page":"Introduction","title":"Introduction","text":"nomenclature: 10.1016/j.ijheatfluidflow.2006.02.006\nshape function definition thanks to the Fortran 90 code https://github.com/blackcata/SEM.git and the related paper 10.1016/j.ijheatmasstransfer.2019.02.061\nhttps://nheri-simcenter.github.io/WE-UQ-Documentation/common/technical_manual/desktop/WEUQ/TinF.html for detailed description of the procedure\nDFSEM: 10.1007/s10494-013-9488-2","category":"page"}]
}
