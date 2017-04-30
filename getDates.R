library(ggplot2)
library(insol)
##### Get the holiday dates
year=2017
getHols <- function(year) {
  jdays = JD(seq(ISOdate(year, 1, 1), ISOdate(year, 12, 31), by = 'min'))
  decl = declination(jdays)
  wintersolstice = which(decl == min(decl))
  summersolstice = which(decl == max(decl))
  JD(jdays[c(summersolstice, wintersolstice)], inv = TRUE)
  winSol <- JD(jdays[wintersolstice], inv = TRUE)
  sumSol <- JD(jdays[summersolstice], inv = TRUE)
  fallEq <- sumSol + (winSol - sumSol) / 2
  
  lastyear <- year-1
  jdays2 = JD(seq(ISOdate(lastyear, 1, 1), ISOdate(lastyear, 12, 31), by =
                    'min'))
  decl2 = declination(jdays2)
  lastwintersolstice = which(decl2 == min(decl2))
  lastwinSol <- JD(jdays2[lastwintersolstice], inv = TRUE)
  springEq <- lastwinSol + (sumSol - lastwinSol) / 2
  
  # nextyear <- year+1 jdays3 = JD(seq(ISOdate(nextyear, 1, 1),
  # ISOdate(nextyear, 12, 31), by='min')) decl3 = declination(jdays3) 
  # nextwintersolstice=which(decl3==min(decl3)) 
  # nextsummersolstice=which(decl3==max(decl3)) nextwinSol <-
  # JD(jdays3[nextwintersolstice], inv=TRUE) nextsumSol <-
  # JD(jdays3[nextsummersolstice], inv=TRUE) nextfallEq <- nextsumSol +
  # (nextwinSol - nextsumSol) / 2
  
  winCross <- lastwinSol + (springEq - lastwinSol) / 2
  springCross <- springEq + (sumSol - springEq) / 2
  summerCross <- sumSol + (fallEq - sumSol) / 2
  fallCross <- fallEq + (winSol - fallEq) / 2
  ## still need to add the nadir calculations
  fallNadir1 <- fallEq + (fallCross - fallEq)/2
  fallNadir2 <- fallCross + (winSol - fallCross)/2
  winNadir1 <- lastwinSol + (winCross - lastwinSol)/2
  winNadir2 <- winCross + (springEq - winCross)/2
  springNadir1 <- springEq + (springCross-springEq)/2
  springNadir2 <- springCross + (sumSol - springCross)/2
  summerNadir1 <- sumSol + (summerCross - sumSol)/2
  summerNadir2 <- summerCross + (fallEq - summerCross)/2
  holidays <- c(fallEq, fallNadir1,
                fallCross, fallNadir2,
                winSol, winNadir1,
                winCross, winNadir2, 
                springEq, springNadir1,
                springCross, springNadir2,
                sumSol, summerNadir1,
                summerCross, summerNadir2)
  return(holidays) 
}
 ## Test the function
names <- c("fallEq", 
           "fallNadir1", 
           "fallCross", 
           "fallNadir2", 
           "winSol", 
           "winNadir1", 
           "winCross",
           "winNadir2",
           "springEq",
           "springNadir1", 
           "springCross", 
           "springNadir2",
           "sumSol", 
           "summerNadir1",
           "summerCross",
           "summerNadir2")
hols <- getHols(2017)

for (i in 1:16) {
   print(paste(names[i], hols[i]))
}




print(names)
print(hols)

print(names[3])
print(hols[3])

# Testing another year
hols <- getHols(2018)
print(names)
print(hols)

print(names[2])
print(hols[2])
#####
# Festivity function stub
festivity <- function(date) {
  cos(date)
}

# test the function stub
festivity(pi) # should be -1
festivity(0) # should be 1
festivity("soup") # should give an error because you can't do math on strings

#### import traditions & celebrations

celebrations <- read.csv("celebrations.csv", header=T, colClasses = "character")

springCrossId <- which(celebrations$holName=="springCross")
print(celebrations[springCrossId,]$Tradition)
#[1] "singing Solidarity Forever and going out for a nice dinner."