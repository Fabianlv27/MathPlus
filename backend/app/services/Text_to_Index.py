
def Text_to_Index(data):
    new_data=data.copy()
    
    for index,e in enumerate(data["escenas"][0]["insts"]):
        for i,t in enumerate(e["tgs"]):
            separado=t.split(":")
            inicio=data["escenas"][0]["cont"][int(separado[0])].find(separado[1])
            if inicio!=-1:
                fin=inicio+len(separado[1])
                new_data["escenas"][0]["insts"][index]["tgs"][i]=separado[0]+":("+str(inicio)+"-"+str(fin)+")"
    return new_data