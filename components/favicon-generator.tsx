"use client"

import Image from "next/image"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function FaviconGenerator() {
  const [activeTab, setActiveTab] = useState<string>("standard")
  
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6">Favicon Generator</h1>
      <p className="mb-8 text-muted-foreground">
        This tool helps you visualize how your logos will look as favicons. You can take screenshots of these 
        sized logos and save them as the appropriate favicon files.
      </p>
      
      <Tabs defaultValue="standard" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="standard">Standard Favicons</TabsTrigger>
          <TabsTrigger value="apple">Apple Touch Icons</TabsTrigger>
        </TabsList>
        
        <TabsContent value="standard" className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle>Light Theme Favicon</CardTitle>
                <CardDescription>
                  Save this as favicon-light.ico in your public folder
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center space-y-6">
                <div className="border border-dashed border-gray-300 dark:border-gray-700 p-4 rounded-lg">
                  <div className="flex flex-col items-center space-y-4">
                    <div className="flex items-center space-x-8">
                      <div className="flex flex-col items-center">
                        <p className="text-sm text-muted-foreground mb-2">64x64</p>
                        <div className="bg-white p-2 rounded-md shadow-md">
                          <Image 
                            src="/light-logo.png" 
                            alt="Light Logo 64px" 
                            width={64} 
                            height={64} 
                            className="object-contain"
                          />
                        </div>
                      </div>
                      <div className="flex flex-col items-center">
                        <p className="text-sm text-muted-foreground mb-2">32x32</p>
                        <div className="bg-white p-2 rounded-md shadow-md">
                          <Image 
                            src="/light-logo.png" 
                            alt="Light Logo 32px" 
                            width={32} 
                            height={32} 
                            className="object-contain"
                          />
                        </div>
                      </div>
                      <div className="flex flex-col items-center">
                        <p className="text-sm text-muted-foreground mb-2">16x16</p>
                        <div className="bg-white p-2 rounded-md shadow-md">
                          <Image 
                            src="/light-logo.png" 
                            alt="Light Logo 16px" 
                            width={16} 
                            height={16} 
                            className="object-contain"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Dark Theme Favicon</CardTitle>
                <CardDescription>
                  Save this as favicon-dark.ico in your public folder
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center space-y-6">
                <div className="border border-dashed border-gray-300 dark:border-gray-700 p-4 rounded-lg">
                  <div className="flex flex-col items-center space-y-4">
                    <div className="flex items-center space-x-8">
                      <div className="flex flex-col items-center">
                        <p className="text-sm text-muted-foreground mb-2">64x64</p>
                        <div className="bg-gray-900 p-2 rounded-md shadow-md">
                          <Image 
                            src="/dark-logo.png" 
                            alt="Dark Logo 64px" 
                            width={64} 
                            height={64} 
                            className="object-contain"
                          />
                        </div>
                      </div>
                      <div className="flex flex-col items-center">
                        <p className="text-sm text-muted-foreground mb-2">32x32</p>
                        <div className="bg-gray-900 p-2 rounded-md shadow-md">
                          <Image 
                            src="/dark-logo.png" 
                            alt="Dark Logo 32px" 
                            width={32} 
                            height={32} 
                            className="object-contain"
                          />
                        </div>
                      </div>
                      <div className="flex flex-col items-center">
                        <p className="text-sm text-muted-foreground mb-2">16x16</p>
                        <div className="bg-gray-900 p-2 rounded-md shadow-md">
                          <Image 
                            src="/dark-logo.png" 
                            alt="Dark Logo 16px" 
                            width={16} 
                            height={16} 
                            className="object-contain"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="apple">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle>Light Theme Apple Touch Icon</CardTitle>
                <CardDescription>
                  Save this as apple-icon-light.png (180x180px) in your public folder
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center space-y-6">
                <div className="border border-dashed border-gray-300 dark:border-gray-700 p-4 rounded-lg">
                  <div className="bg-white p-4 rounded-md shadow-md">
                    <Image 
                      src="/light-logo.png" 
                      alt="Light Apple Touch Icon" 
                      width={180} 
                      height={180} 
                      className="object-contain"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Dark Theme Apple Touch Icon</CardTitle>
                <CardDescription>
                  Save this as apple-icon-dark.png (180x180px) in your public folder
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center space-y-6">
                <div className="border border-dashed border-gray-300 dark:border-gray-700 p-4 rounded-lg">
                  <div className="bg-gray-900 p-4 rounded-md shadow-md">
                    <Image 
                      src="/dark-logo.png" 
                      alt="Dark Apple Touch Icon" 
                      width={180} 
                      height={180} 
                      className="object-contain"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
      
      <div className="mt-10 p-6 bg-muted rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Instructions:</h2>
        <ol className="list-decimal pl-5 space-y-2">
          <li>Take screenshots of the scaled logos above at the appropriate sizes</li>
          <li>Save them with the filenames shown in the descriptions</li>
          <li>For .ico files, you can use an online converter to convert PNG screenshots to ICO format</li>
          <li>Place all generated files in the <code>/public</code> directory of your project</li>
          <li>Refresh your application to see the favicons in action</li>
        </ol>
        <div className="mt-6 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-md border border-amber-200 dark:border-amber-700/50">
          <p className="text-amber-800 dark:text-amber-300 font-medium">Alternative: Using ImageMagick</p>
          <p className="text-sm mt-2">If you have ImageMagick installed, you can run these commands to generate favicon files:</p>
          <pre className="mt-2 p-3 bg-gray-100 dark:bg-gray-800 rounded text-xs overflow-x-auto">
            convert -background transparent public/dark-logo.png -define icon:auto-resize=64,48,32,16 public/favicon-dark.ico{"\n"}
            convert -background transparent public/light-logo.png -define icon:auto-resize=64,48,32,16 public/favicon-light.ico{"\n"}
            convert -background transparent public/dark-logo.png -resize 180x180 public/apple-icon-dark.png{"\n"}
            convert -background transparent public/light-logo.png -resize 180x180 public/apple-icon-light.png
          </pre>
        </div>
      </div>
    </div>
  )
}