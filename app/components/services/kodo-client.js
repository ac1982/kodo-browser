const Qiniu = require("qiniu");
const each = require("array-each");

angular.module("web").factory("KodoClient", [
  "$q",
  "Config",
  "AuthInfo",
  function ($q, Config, AuthInfo) {
    return {
      getBucketIdNameMapper: getBucketIdNameMapper
    };

    function getBucketIdNameMapper() {
      const df = $q.defer();

      getBucketManager().listBuckets((err, body) => {
        if (err) {
          df.reject(err);
        } else if (body.error) {
          df.reject({message: body.error});
        } else {
          let m = {};
          each(body, (bucket) => {
            m[bucket.id] = bucket.tbl;
          })
          df.resolve(m);
        }
      });

      return df.promise;
    }

    function getBucketManager() {
      const authInfo = AuthInfo.get();
      const mac = new Qiniu.auth.digest.Mac(authInfo.id, authInfo.secret);
      const uc_url = Config.uc_url;
      return {
        listBuckets: (callbackFunc) => {
          const requestURI = `${uc_url}/v2/buckets`;
          const digest = Qiniu.util.generateAccessToken(mac, requestURI, null);
          Qiniu.rpc.postWithoutForm(requestURI, digest, callbackFunc)
        }
      };
    }
  }
]);
