
const get = async (sap = '0') => {

    const raw = await fetch(`http://ugaccessallocation.otapi.corp.riotinto.org/api/v1/UgAccessAllocation/CheckData?sap=${sap}&hotstampNo=0&deviceId=0A400&face=1`, { headers: { Authorization: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJjbGllbnRJZCI6IkQ2MDJEQ0UyLTk3MjUtNEZDNy1BRkI1LTNGM0FCRUY3OEE0QiIsImNsaWVudFNlY3JldCI6IjIxZTRiNzcxYzQ1OGQyNmY0NzhlOGQ3ZjNlMjIzN2Y0Y2YyYjgzNTNmNTFmOTNkMjYwYzYzODBhNTY3NmFhY2FmMmJmZDU4NzM2Mzc5YTVhMGE3M2RmNTIxMDMzNWY5NTNlZDljN2UwNWE0M2NmMTBiNzgxNzNkODVhYzlkOTQ4IiwidG9rZW5JZCI6IjdiNzZiMGJmLWIzODItNGU3ZS1iZTk1LWI4ZGEzMTExMWNiZSIsImRhdGEiOm51bGwsImlhdCI6MTY2NDc4NjYxNSwiZXhwIjo3OTQyNDc4NjYxNX0.79zgvSUNzxgtPhVncqqKIwlsvsRotCZfCfVLbAOt__o' } })
    const { Data } = await raw.json()
    const { CardNum } = Data

    const raw0 = await fetch(`http://ims-tyco-aggregator.otapi.corp.riotinto.org/api/v1/personnel/search/${CardNum}/1/cardNum`, { headers: { Authorization: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJjbGllbnRJZCI6IkQ2MDJEQ0UyLTk3MjUtNEZDNy1BRkI1LTNGM0FCRUY3OEE0QiIsImNsaWVudFNlY3JldCI6IjIxZTRiNzcxYzQ1OGQyNmY0NzhlOGQ3ZjNlMjIzN2Y0Y2YyYjgzNTNmNTFmOTNkMjYwYzYzODBhNTY3NmFhY2FmMmJmZDU4NzM2Mzc5YTVhMGE3M2RmNTIxMDMzNWY5NTNlZDljN2UwNWE0M2NmMTBiNzgxNzNkODVhYzlkOTQ4IiwidG9rZW5JZCI6IjdiNzZiMGJmLWIzODItNGU3ZS1iZTk1LWI4ZGEzMTExMWNiZSIsImRhdGEiOm51bGwsImlhdCI6MTY2NDc4NjYxNSwiZXhwIjo3OTQyNDc4NjYxNX0.79zgvSUNzxgtPhVncqqKIwlsvsRotCZfCfVLbAOt__o' } })
    const { Tyco: { Face }, IMS: { Email, JobDesc } } = await raw0.json()

    return { ...Data, Face, Email, JobDesc }

}

exports.useIMS = (req, res, next) => {

    if (req.originalUrl.indexOf('/api/person') === 0) {

        console.log(`[Request] on [/api/person] => ${req.query.sap}`)
        get(req.query.sap)
            .then((e) => res.json(e))
            .catch((e) => res.status(500).end(e.message))

    } else next()

}